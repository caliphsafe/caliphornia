import { ReleasesHub } from "@/components/views/releases-hub"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase-admin"

export default async function HomePage() {
  const cookieStore = cookies()

  // If they've paid, let them in without further checks
  const supporter = cookieStore.get("supporter")?.value === "1"
  if (supporter) {
    return <ReleasesHub />
  }

  // Otherwise they must have passed the email gate
  const gate = cookieStore.get("gate")?.value === "1"
  const gateEmail = cookieStore.get("gate_email")?.value

  if (!gate || !gateEmail) {
    redirect("/")
  }

  // Verify the email truly exists in Supabase (stronger than cookie-only)
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
    // Not recognized → back to gate
    redirect("/")
  }

  // Passed both checks
  return <ReleasesHub />
}
