import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json({
    track: process.env.NEXT_PUBLIC_TRACK_URL || null,
  })
}
