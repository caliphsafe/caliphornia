import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase-admin"
import ReleasesHub from "@/components/views/releases-hub"

export default async function ReleasesPage() {
  const cookieStore = cookies()

  // If they've already paid (cookie exists), let them straight in
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

  // ✅ NEW: Check if this email has made a contribution
  const { data: contribution } = await supabaseAdmin
    .from("contributions")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle()

  if (contribution) {
    // ✅ Re-issue supporter cookie for 1 year
    cookies().set("supporter", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: true,
    })
    return <ReleasesHub supporter={true} />
  }

  // Passed all checks but no payment yet → show normal view
  return <ReleasesHub supporter={false} />
}
