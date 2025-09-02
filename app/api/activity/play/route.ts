// app/api/activity/play/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

function safeDecode(v: string | null): string | null {
  if (!v) return null
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

export async function POST(req: Request) {
  // Use Vercel-provided geolocation headers (may be URL-encoded in some environments)
  const hdr = new Headers(req.headers)
  const rawCity   = hdr.get("x-vercel-ip-city")
  const rawRegion = hdr.get("x-vercel-ip-country-region") || hdr.get("x-vercel-ip-region")
  const rawCountry= hdr.get("x-vercel-ip-country")

  const city    = safeDecode(rawCity)
  const region  = safeDecode(rawRegion)
  const country = safeDecode(rawCountry)

  const { error } = await supabaseAdmin.from("activity").insert({
    type: "play",
    city,
    region,
    country,
  })

  if (error) {
    console.error("[activity:play] insert error", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
