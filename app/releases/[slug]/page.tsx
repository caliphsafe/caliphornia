// app/releases/[slug]/page.tsx
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase-admin"
import ReleasesHub from "@/components/views/releases-hub"
import { SONGS } from "@/data/songs"

export default async function ReleasesSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // Validate slug against the song registry
  const song = SONGS[slug]
  if (!song) {
    return notFound()
  }

  const cookieStore = cookies()

  // Prefer per-song cookies; fall back to legacy global cookies to avoid breaking existing users
  const supporter =
    cookieStore.get(`supporter_${slug}`)?.value === "1" ||
    cookieStore.get("supporter")?.value === "1"

  if (supporter) {
    // They have full access for this slug → show hub as supporter
    return <ReleasesHub supporter={true} songSlug={slug} />
  }

  // Otherwise, they must have passed the gate (per-song first; fallback to legacy)
  const gate =
    cookieStore.get(`gate_${slug}`)?.value === "1" ||
    cookieStore.get("gate")?.value === "1"

  const gateEmail =
    cookieStore.get(`gate_email_${slug}`)?.value ??
    cookieStore.get("gate_email")?.value

  if (!gate || !gateEmail) {
    redirect("/")
  }

  // Verify email exists in Supabase (same as your current check)
  const email = decodeURIComponent(gateEmail).toLowerCase().trim()
  if (!email) {
    redirect("/")
  }

  const { data, error } = await supabaseAdmin
    .from("emails")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    redirect("/")
  }

  // Passed checks → non-supporter view of hub
  return <ReleasesHub supporter={false} songSlug={slug} />
}
