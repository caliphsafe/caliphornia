import { DownloadView } from "@/components/views/download-view"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function DownloadPage() {
  const cookieStore = cookies()
  const supporter = cookieStore.get("supporter")?.value === "1"

  if (!supporter) {
    redirect("/buy")
  }

  return <DownloadView />
}
