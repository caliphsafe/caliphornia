// app/api/activity/play/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SONGS } from "@/data/songs";

function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// tiny cookie check (no deps)
function hasCookie(header: string | null, name: string, val = "1") {
  if (!header) return false;
  return header
    .split(";")
    .map((c) => c.trim())
    .some((c) => {
      const [k, v] = c.split("=");
      return k === name && v === val;
    });
}

export async function POST(req: Request) {
  // 1) Resolve song slug (JSON body {song} OR ?song= in query)
  let slug = "";
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.song === "string") slug = body.song.trim().toLowerCase();
    }
  } catch {
    // ignore body parse errors; we'll try query param next
  }
  if (!slug) {
    const url = new URL(req.url);
    slug = (url.searchParams.get("song") || url.searchParams.get("s") || "").trim().toLowerCase();
  }

  // 2) Validate slug
  if (!slug || !SONGS[slug]) {
    return NextResponse.json({ ok: false, error: "unknown_song" }, { status: 400 });
  }

  // 3) De-dupe: if we've already logged a play this session, no-op
  const cookieHeader = req.headers.get("cookie");
  const playedCookieName = `played_${slug}`;
  if (hasCookie(cookieHeader, playedCookieName)) {
    return NextResponse.json({ ok: true, dedup: true });
  }

  // 4) Geolocation (best effort)
  const hdr = new Headers(req.headers);
  const rawCity = hdr.get("x-vercel-ip-city");
  const rawRegion = hdr.get("x-vercel-ip-country-region") || hdr.get("x-vercel-ip-region");
  const rawCountry = hdr.get("x-vercel-ip-country");

  const city = safeDecode(rawCity);
  const region = safeDecode(rawRegion);
  const country = safeDecode(rawCountry);

  // 5) Insert activity row (per-song)
  const { error } = await supabaseAdmin.from("activity").insert({
    type: "play",
    song_slug: slug,
    city,
    region,
    country,
  });

  if (error) {
    console.error("[activity:play] insert error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // 6) Set short-lived cookie to avoid duplicate logs (e.g., 6 hours)
  const res = NextResponse.json({ ok: true });
  res.cookies.set(playedCookieName, "1", {
    path: "/",
    maxAge: 60 * 60 * 6, // 6 hours
    httpOnly: false,
    sameSite: "lax",
    secure: true,
  });
  return res;
}
