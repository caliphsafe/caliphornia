// app/api/emails.csv/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function csvEscape(value: string | null | undefined) {
  const v = value ?? "";
  const needsQuotes = /[",\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export async function GET(req: Request) {
  // Optional simple protection:
  // If you set EMAIL_EXPORT_TOKEN in env, require it via ?token=... or header x-export-token
  const tokenRequired = process.env.EMAIL_EXPORT_TOKEN;
  if (tokenRequired) {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || req.headers.get("x-export-token");
    if (token !== tokenRequired) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  // Fetch emails
  const { data, error } = await supabaseAdmin
    .from("emails")
    .select("email, source, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return new NextResponse("Failed to fetch emails", { status: 500 });
  }

  const rows = data ?? [];
  const header = ["email", "source", "created_at"];
  const lines = [header.join(",")];

  for (const r of rows) {
    const email = csvEscape(r.email as string);
    const source = csvEscape((r as any).source || "");
    const createdAt = csvEscape((r as any).created_at || "");
    lines.push([email, source, createdAt].join(","));
  }

  const body = lines.join("\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="emails.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
