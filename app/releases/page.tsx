import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase-admin"
import ReleasesHub from "@/components/views/releases-hub"

export default async function ReleasesPage() {
  const cookieStore = cookies()

  // If they've paid, let them straight in
  const supporter = cookieStore.get("supporter")?.value === "1"
  if (supporter) {
    return <ReleasesHub supporter={true} />
  }

  // Otherwise they must have passed the email gate
  const gate = cookieStore.get("gate")?.value === "1"
  const gateEmail = cookieStore.get("gate_email")?.value

  if (!gate || !gateEmail) {
    redirect("/")
  }

  // Verify email exists in Supabase
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

  // Passed all checks → show ReleasesHub
  return <ReleasesHub supporter={false} />
}
