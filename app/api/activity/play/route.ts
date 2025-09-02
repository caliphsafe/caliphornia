// app/api/activity/play/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  // Use Vercel-provided geolocation headers if available
  const hdr = new Headers(req.headers)
  const city = hdr.get("x-vercel-ip-city") || null
  const region = hdr.get("x-vercel-ip-country-region") || hdr.get("x-vercel-ip-region") || null
  const country = hdr.get("x-vercel-ip-country") || null

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
