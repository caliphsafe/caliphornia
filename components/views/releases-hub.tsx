"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { LockClosedIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid"

type Drop = {
  slug: string
  title: string
  cover?: string
  status: "live" | "upcoming"
  dateLabel?: string
}

type PreviousRelease = {
  title: string
  cover: string
  links: {
    apple?: string
    spotify?: string
    tidal?: string
    youtube?: string
  }
}

const DROPS: Drop[] = [
  // FEATURED (live)
  { slug: "/home", title: "POLYGAMY", cover: "/polygamy-cover.png", status: "live" },

  // UPCOMING (keep your covers or placeholders)
  { slug: "#", title: "NOT TODAY FT. DELLY", cover: "/not-today-cover.png", status: "upcoming", dateLabel: "Sep 24" },
  { slug: "#", title: "SIMP", cover: "/simp-cover.png", status: "upcoming", dateLabel: "Oct 1" },
  { slug: "#", title: "DROP 4", cover: "/milia-ep-cover.jpg", status: "upcoming", dateLabel: "Oct 8" },
  { slug: "#", title: "DROP 5", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 15" },
  { slug: "#", title: "DROP 6", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 22" },
  { slug: "#", title: "DROP 7", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 29" },
  { slug: "#", title: "DROP 8", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 5" },
  { slug: "#", title: "DROP 9", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 12" },
  { slug: "#", title: "DROP 10", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 19" },
  { slug: "#", title: "DROP 11", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 26" },
  { slug: "#", title: "DROP 12", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Dec 3" },
]

// Replace these with your real covers + streaming URLs
const PREVIOUS_RELEASES: PreviousRelease[] = [
  {
    title: "MARIA JULIA (Single)",
    cover: "/maria-julia-cover.png",
    links: {
      apple: "https://music.apple.com/us/album/maria-julia-single/1828692139?at=1001lry3&ct=dashboard&uo=4",
      spotify: "https://open.spotify.com/album/0tYN2jrPeKd3GvSX5ZL9GK",
      tidal: "https://tidal.com/browse/album/449886502",
      youtube: "https://www.youtube.com/watch?v=xSiBH-F6klU",
    },
  },
  {
    title: "EATER JAMES (Single)",
    cover: "/eater-james-cover.png",
    links: {
      apple: "https://music.apple.com/us/album/eater-james-single/1788913374?at=1001lry3&ct=dashboard&uo=4",
      spotify: "https://open.spotify.com/album/6Fifi70A9hcS7SWMXmNzjn",
      tidal: "https://tidal.com/browse/album/409282874",
      youtube: "https://www.youtube.com/watch?v=OJsX3XioJb8",
    },
  },
  {
    title: "FREE LIPH (EP)",
    cover: "/prev3-cover.png",
    links: {
      apple: "https://music.apple.com/us/album/free-liph/1781918994",
      spotify: "https://open.spotify.com/album/1Y4kh3SZuSyTp1Mm4xO032",
      tidal: "https://tidal.com/browse/album/401698101",
      youtube: "https://youtube.com/playlist?list=OLAK5uy_mxiilUPgUyGTiaWR8z6GWhShifQ7MGtZY&si=EEMpBQS-NLQZezdr",
    },
  },
]

// --------- UI Helpers ---------
function Chip({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold shadow-sm"
      style={{ backgroundColor: dark ? "rgba(0,0,0,0.55)" : "#4a3f35", color: "white" }}
    >
      {children}
    </span>
  )
}

// Shared tile for live/upcoming (keeps your blur/lock rules EXACT)
function ReleaseTile({ drop }: { drop: Drop }) {
  const isLive = drop.status === "live"
  const Wrapper: any = isLive ? Link : "div"
  const wrapperProps = isLive
    ? { href: drop.slug, className: "block group focus:outline-none focus:ring-2 focus:ring-[#B8A082]" }
    : { className: "block" }

  return (
    <Wrapper {...wrapperProps}>
      <div className="rounded-2xl overflow-hidden border border-[#B8A082]/70 bg-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative backdrop-blur-[2px]">
        <div className="relative w-full aspect-square bg-black">
          {/* Cover (responsive blur for upcoming only: mobile 3px, desktop 12px) */}
          <Image
            src={drop.cover || "/cover-placeholder.png"}
            alt={`${drop.title} cover`}
            fill
            className={`object-cover ${isLive ? "" : "blur-[3px] md:blur-[12px] opacity-80 scale-105"}`}
            sizes="(max-width: 768px) 60vw, 360px"
            priority={isLive}
          />

          {/* Soft veil on upcoming */}
          {!isLive && <div className="absolute inset-0 bg-[rgba(243,242,238,0.35)]" />}

          {/* Center lock for upcoming */}
          {!isLive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="backdrop-blur-sm bg-[rgba(0,0,0,0.35)] border border-[#B8A082] rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-md">
                <LockClosedIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          )}

          {/* Status chip (LIVE or date) */}
          <div className="absolute top-2 left-2">
            <Chip dark={!isLive}>{isLive ? "LIVE" : drop.dateLabel ?? "SOON"}</Chip>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

// Previous (no blur/lock). Opens a streaming sheet instead of direct link.
function PreviousTile({
  item,
  onOpen,
}: {
  item: PreviousRelease
  onOpen: (release: PreviousRelease) => void
}) {
  return (
    <button
      onClick={() => onOpen(item)}
      className="block group focus:outline-none focus:ring-2 focus:ring-[#B8A082] rounded-2xl"
      aria-label={`${item.title} — streaming`}
      title={`${item.title} — streaming`}
    >
      <div className="rounded-2xl overflow-hidden border border-[#B8A082]/70 bg-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative backdrop-blur-[2px]">
        <div className="relative w-full aspect-square bg-black">
          <Image
            src={item.cover || "/cover-placeholder.png"}
            alt={`${item.title} cover`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 60vw, 360px"
          />
          {/* Chip: STREAMING */}
          <div className="absolute top-2 left-2">
            <span className="rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white bg-[#303030]">
              STREAMING
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

// Streaming sheet modal
function StreamingSheet({
  open,
  onClose,
  release,
}: {
  open: boolean
  onClose: () => void
  release: PreviousRelease | null
}) {
  if (!open || !release) return null

  const LinkBtn = ({
    label,
    href,
    bg,
  }: {
    label: string
    href?: string
    bg: string
  }) => (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between w-full rounded-xl px-4 py-3 font-semibold text-white shadow-sm transition ${
        href ? "hover:opacity-90" : "opacity-60 cursor-not-allowed"
      }`}
      style={{ backgroundColor: bg }}
    >
      <span>{label}</span>
      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
    </a>
  )

  return (
    <div className="fixed inset-0 z-[120]">
      {/* Dim backdrop with subtle noise */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.5)), url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.03%22/></svg>')",
          backgroundSize: "cover, 160px 160px",
        }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto max-w-xl w-[92%] md:w-[72%] bg-[#F3F2EE] border border-[#B8A082] rounded-t-3xl shadow-[0_-18px_50px_rgba(0,0,0,0.28)] overflow-hidden">
          {/* Handle + close */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex-1 flex justify-center">
              <div className="w-12 h-1.5 bg-[#9f8b79] rounded-full" />
            </div>
            <button
              onClick={onClose}
              className="ml-2 p-2 rounded-full hover:bg-black/5 text-[#4a3f35]"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Header */}
          <div className="px-5 pb-4 flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#B8A082] shadow">
              <Image src={release.cover} alt={`${release.title} cover`} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-black truncate">{release.title}</h3>
              <p className="text-sm" style={{ color: "#867260" }}>
                Listen on your favorite platform
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="px-5 pb-5 grid grid-cols-1 gap-3">
            <LinkBtn label="Apple Music" href={release.links.apple} bg="#111111" />
            <LinkBtn label="Spotify" href={release.links.spotify} bg="#1DB954" />
            <LinkBtn label="TIDAL" href={release.links.tidal} bg="#0A0A0A" />
            <LinkBtn label="YouTube" href={release.links.youtube} bg="#FF0000" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReleasesHub() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activePrev, setActivePrev] = useState<PreviousRelease | null>(null)

  const live = DROPS.find((d) => d.status === "live")
  const upcoming = DROPS.filter((d) => d.status === "upcoming")
  const later = upcoming.slice(6)

  return (
    <div
      className="min-h-screen relative"
      // Layered background: soft gradient + vignette + ultra-subtle noise
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.75), rgba(243,242,238,1)), linear-gradient(180deg, rgba(230,224,212,0.35), rgba(243,242,238,1) 30%), #F3F2EE",
      }}
    >
      {/* Subtle top flourish */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[120vw] h-[120px] blur-[60px] opacity-50"
        style={{ background: "radial-gradient(closest-side, rgba(184,160,130,0.35), transparent)" }}
      />

      {/* Header */}
      <header className="px-6 pt-8 pb-5 flex flex-col items-center text-center">
        <Image
          src="/caliphornia-logo.svg"
          alt="CALIPHORNIA"
          width={180}
          height={40}
          className="h-auto w-[160px] md:w-[180px]"
          priority
        />
        <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed" style={{ color: "#867260" }}>
          Tune in weekly and help release Caliph’s music to streaming—your support decides what drops next.
        </p>
      </header>

      {/* Featured (billboard) */}
      {live && (
        <section className="px-5">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,420px)_1fr] gap-4 md:gap-6 items-stretch">
              <div className="rounded-3xl overflow-hidden border border-[#B8A082]/70 bg-white/40 shadow-[0_30px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                <ReleaseTile drop={live} />
              </div>
              <div className="rounded-3xl border border-[#B8A082]/70 bg-[#F3F2EE]/80 p-5 md:p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-black">This Week’s Drop</h2>
                  <p className="mt-2 text-sm md:text-base" style={{ color: "#4a3f35" }}>
                    Jump in, fund the run, and push this record to streaming. Plays, purchases, and momentum here shape
                    what gets visuals and what drops next.
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/home"
                    className="text-center rounded-full px-4 py-2.5 font-semibold text-white hover:opacity-90 transition"
                    style={{ backgroundColor: "#4a3f35" }}
                  >
                    Enter Drop
                  </Link>
                  <Link
                    href="/buy"
                    className="text-center rounded-full px-4 py-2.5 font-semibold border border-[#B8A082] hover:bg-black/5 transition"
                    style={{ color: "#4a3f35" }}
                  >
                    Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Next Up — horizontal runway */}
      <section className="mt-8 md:mt-10">
        <div className="px-5 flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-black">Next Up</h3>
          <div className="text-xs md:text-sm" style={{ color: "#867260" }}>
            Weekly releases
          </div>
        </div>

        <div className="px-5">
          <div
            className="mx-auto max-w-6xl overflow-x-auto snap-x snap-mandatory scrollbar-thin"
            style={{ scrollbarColor: "#9f8b79 transparent" }}
          >
            <div className="flex gap-3 sm:gap-4 md:gap-5 min-w-max pr-4">
              {upcoming.slice(0, 6).map((d, idx) => (
                <div key={idx} className="w-[52vw] xs:w-[44vw] sm:w-[33vw] md:w-[220px] snap-start shrink-0">
                  <ReleaseTile drop={d} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Later */}
      {later.length > 0 && (
        <section className="mt-8 md:mt-10 px-5">
          <h3 className="text-base md:text-lg font-semibold text-black mb-3 md:mb-4">Later</h3>
          <div className="mx-auto max-w-6xl grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {later.map((d, i) => (
              <ReleaseTile key={`later-${i}`} drop={d} />
            ))}
          </div>
        </section>
      )}

      {/* Previously Released — opens streaming sheet */}
      {PREVIOUS_RELEASES.length > 0 && (
        <section className="mt-10 md:mt-12 px-5 pb-24">
          <h3 className="text-base md:text-lg font-semibold text-black mb-3 md:mb-4">Previously Released</h3>
          <div className="mx-auto max-w-6xl grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {PREVIOUS_RELEASES.slice(0, 3).map((item, i) => (
              <PreviousTile
                key={`prev-${i}`}
                item={item}
                onOpen={(release) => {
                  setActivePrev(release)
                  setSheetOpen(true)
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Streaming modal */}
      <StreamingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        release={activePrev}
      />
    </div>
  )
}
