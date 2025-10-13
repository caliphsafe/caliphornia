// app/api/goal/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SONGS } from "@/data/songs";

function toInt(v: string | undefined, defaultVal: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.floor(n) : defaultVal;
}

function perSongEnv(keyBase: string, slug: string): string | undefined {
  // FUNDING_GOAL_CENTS_POLYGAMY, FUNDING_GOAL_DOLLARS_POLYGAMY
  const upper = slug.toUpperCase();
  return (
    (process.env[`${keyBase}_${upper}`] as string | undefined) ??
    (process.env[keyBase] as string | undefined)
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("song") || "polygamy").toLowerCase();

  // Validate song
  const song = SONGS[slug];
  if (!song) {
    return NextResponse.json({ ok: false, error: "unknown_song" }, { status: 404 });
  }

  // Per-song goal first, fallback to global goal
  const goalCents =
    toInt(perSongEnv("FUNDING_GOAL_CENTS", slug), 0) ||
    toInt(perSongEnv("FUNDING_GOAL_DOLLARS", slug), 0) * 100;

  if (!goalCents || goalCents <= 0) {
    return NextResponse.json({ ok: false, error: "goal_not_configured" }, { status: 400 });
  }

  // Try song-scoped contributions first (requires contributions.song_slug)
  // If the column doesn't exist yet, fall back to global sum.
  let totalUSD = 0;

  // Attempt 1: song-scoped
  try {
    const scoped = await supabaseAdmin
      .from("contributions")
      .select("amount, currency, song_slug")
      .eq("song_slug", slug);

    if (!scoped.error && Array.isArray(scoped.data)) {
      totalUSD =
        scoped.data
          .filter((r) => (r.currency || "USD").toUpperCase() === "USD")
          .reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
    } else {
      // Column might not exist yet; fall back below
      // console.warn("[goal] song-scoped query failed, falling back:", scoped.error);
      throw scoped.error || new Error("song_scoped_query_failed");
    }
  } catch {
    // Attempt 2: global (legacy behavior)
    const global = await supabaseAdmin
      .from("contributions")
      .select("amount, currency");

    if (global.error) {
      // Hard failure
      // console.error(global.error);
      return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 500 });
    }

    totalUSD =
      (global.data || [])
        .filter((r) => (r.currency || "USD").toUpperCase() === "USD")
        .reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
  }

  const totalCents = Math.round(totalUSD * 100);
  const remainingCents = Math.max(0, goalCents - totalCents);
  const percent = Math.min(100, Math.round((totalCents / goalCents) * 100));

  return NextResponse.json({
    ok: true,
    song: slug,
    goal_cents: goalCents,
    total_cents: totalCents,
    remaining_cents: remainingCents,
    percent,
  });
}
