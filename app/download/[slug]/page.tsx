import { DownloadView } from "@/components/views/download-view"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { SONGS } from "@/data/songs"

export default function DownloadSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // ✅ Ensure the song exists
  const song = SONGS[slug]
  if (!song) {
    return notFound()
  }

  // ✅ Check per-song supporter cookie (fallback to legacy global)
  const cookieStore = cookies()
  const supporter =
    cookieStore.get(`supporter_${slug}`)?.value === "1" ||
    cookieStore.get("supporter")?.value === "1"

  if (!supporter) {
    redirect(`/buy/${slug}`)
  }

  return <DownloadView slug={slug} />
}
