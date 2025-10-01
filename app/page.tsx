import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { LeadCapture } from "@/components/views/lead-capture"

export default async function Page() {
  const cookieStore = cookies()

  // If they've paid, skip gate → send to /releases
  const supporter = cookieStore.get("supporter")?.value === "1"
  if (supporter) {
    redirect("/releases")
  }

  // If they passed the email gate
  const gate = cookieStore.get("gate")?.value === "1"
  const gateEmail = cookieStore.get("gate_email")?.value

  if (!gate || !gateEmail) {
    return <LeadCapture />
  }

  const email = decodeURIComponent(gateEmail).toLowerCase().trim()
  if (!email) {
    return <LeadCapture />
  }

  const { data, error } = await supabaseAdmin
    .from("emails")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return <LeadCapture />
  }

  // Passed both checks → send to releases
  redirect("/releases")
}
