// app/api/activity/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("activity")
    .select("type, amount_cents, city, region, country, created_at")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[activity:get] error", error)
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 })
  }

  // shape for UI
  const items = (data || []).map((row) => {
    let message = ""
    if (row.type === "purchase") {
      const dollars = (row.amount_cents ?? 0) / 100
      message = `Someone bought this song for $${dollars}`
    } else {
      const where = [row.city, row.region].filter(Boolean).join(", ")
      message = where ? `Someone listened from ${where}` : "Someone listened"
    }
    return {
      type: row.type as "purchase" | "play",
      message,
      timestampIso: row.created_at, // ISO string
      date: row.created_at,         // keep for grouping
    }
  })

  return NextResponse.json({ ok: true, items })
}
