// app/api/magic/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Support both ?email= and ?e= for backwards compatibility
    const raw = (url.searchParams.get("email") || url.searchParams.get("e") || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(raw)) {
      // Invalid or missing email → send to landing gate
      return NextResponse.redirect(new URL("/", url), { status: 302 });
    }

    // ✅ Upsert into Supabase (ensures the email is always stored)
    const { data, error } = await supabaseAdmin
      .from("emails")
      .upsert(
        { email: raw, source: "magic_link" }, // mark that it came from this campaign
        { onConflict: "email" }
      )
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Magic link upsert error:", error);
      return NextResponse.redirect(new URL("/", url), { status: 302 });
    }

    if (!data) {
      // Fallback: if something went wrong, redirect home
      return NextResponse.redirect(new URL("/", url), { status: 302 });
    }

    // ✅ Email verified and/or created → set cookies
    const res = NextResponse.redirect(new URL("/releases", url), { status: 302 });
    res.cookies.set("gate", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      sameSite: "lax",
      secure: true,
    });
    res.cookies.set("gate_email", raw, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
      secure: true,
    });

    return res;
  } catch (e) {
    console.error("Magic route error:", e);
    // Fallback → send to gate
    return NextResponse.redirect(new URL("/", req.url), { status: 302 });
  }
}
