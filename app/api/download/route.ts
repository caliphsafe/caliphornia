// app/api/download/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { SONGS } from "@/data/songs";

// tiny cookie helper (server-safe; no 3rd-party deps)
function hasCookie(header: string | null, name: string, value = "1") {
  if (!header) return false;
  // basic parse to avoid false positives: split on ; and trim
  return header
    .split(";")
    .map((c) => c.trim())
    .some((c) => {
      const [k, v] = c.split("=");
      return k === name && v === value;
    });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugParam = (url.searchParams.get("song") || "polygamy").toLowerCase();
  const song = SONGS[slugParam];

  // If the slug is unknown, 404 to avoid leaking anything
  if (!song) {
    return new NextResponse("Unknown song", { status: 404 });
  }

  // Per-song supporter cookie, with legacy fallback
  const cookiesHeader = req.headers.get("cookie");
  const supporterForSong = hasCookie(cookiesHeader, `supporter_${song.slug}`);
  const legacySupporter = hasCookie(cookiesHeader, "supporter");
  const isSupporter = supporterForSong || legacySupporter;

  if (!isSupporter) {
    // Not unlocked → route them to this song’s buy page
    return NextResponse.redirect(new URL(`/buy/${song.slug}`, req.url), { status: 302 });
  }

  // Fetch the full file from song.audioUrl (no preview logic)
  const fileUrl = song.audioUrl;
  if (!fileUrl) {
    return new NextResponse("Missing audio URL for this song", { status: 500 });
  }

  const upstream = await fetch(fileUrl);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Source file unavailable", { status: 502 });
  }

  // Build a clean filename like "Caliph - Polygamy (Prod. By Caliph).mp3"
  const baseName = `${song.artist} - ${song.title}`
    .replace(/[\/\\?%*:|"<>]/g, "") // sanitize for safety
    .trim();
  const filename = `${baseName}.mp3`;

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
