// app/api/magic/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = (url.searchParams.get("e") || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(raw)) {
      // Invalid or missing email → send to gate
      return NextResponse.redirect(new URL("/", url), { status: 302 });
    }

    // Check membership in your Supabase table
    const { data, error } = await supabaseAdmin
      .from("emails")
      .select("id")
      .eq("email", raw)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("magic check error:", error);
      return NextResponse.redirect(new URL("/", url), { status: 302 });
    }

    if (!data) {
      // Not on the list → go to gate
      return NextResponse.redirect(new URL("/", url), { status: 302 });
    }

    // ✅ On the list: set cookie and send to /home
const res = NextResponse.redirect(new URL("/home", url), { status: 302 });
res.cookies.set("gate", "1", {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
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
    console.error(e);
    // Fallback → send to gate
    return NextResponse.redirect(new URL("/", req.url), { status: 302 });
  }
}
