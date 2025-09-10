// app/api/download/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Reuse the public track URL
  const FILE_URL = process.env.NEXT_PUBLIC_TRACK_URL;

  if (!FILE_URL) {
    return new NextResponse("Missing NEXT_PUBLIC_TRACK_URL", { status: 500 });
  }

  // Guard: only allow if supporter cookie is present
  const isSupporter = req.headers.get("cookie")?.includes("supporter=1");
  if (!isSupporter) {
    return NextResponse.redirect(new URL("/buy", req.url), { status: 302 });
  }

  // Fetch the actual file
  const upstream = await fetch(FILE_URL);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Source file unavailable", { status: 502 });
  }

  // Force browser download
  const filename = "Caliph-Polygamy.mp3";
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
      "Content-Length": upstream.headers.get("content-length") || "",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
