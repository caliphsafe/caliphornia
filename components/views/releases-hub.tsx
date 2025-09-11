"use client"

import Image from "next/image"
import Link from "next/link"
import { LockClosedIcon } from "@heroicons/react/24/solid"

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
  url: string // link to streaming (Spotify/Apple/etc.)
}

const DROPS: Drop[] = [
  // FEATURED (live)
  { slug: "/home", title: "POLYGAMY", cover: "/polygamy-cover.png", status: "live" },

  // UPCOMING
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

// TODO: replace these with your actual last 3 releases (covers + streaming URLs)
const PREVIOUS_RELEASES: PreviousRelease[] = [
  { title: "LAST DROP 1", cover: "/prev1-cover.png", url: "#" },
  { title: "LAST DROP 2", cover: "/prev2-cover.png", url: "#" },
  { title: "LAST DROP 3", cover: "/prev3-cover.png", url: "#" },
]

// Shared tile for live/upcoming (keeps your lock/veil/blur rules)
function ReleaseTile({ drop }: { drop: Drop }) {
  const isLive = drop.status === "live"
  const Wrapper: any = isLive ? Link : "div"
  const wrapperProps = isLive
    ? { href: drop.slug, className: "block group focus:outline-none focus:ring-2 focus:ring-[#B8A082]" }
    : { className: "block" }

  return (
    <Wrapper {...wrapperProps}>
      <div className="rounded-2xl overflow-hidden border border-[#B8A082] bg-white/40 shadow-sm relative">
        <div className="relative w-full aspect-square bg-black">
          {/* Cover (responsive blur for upcoming only) */}
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
            <span
              className="rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold"
              style={{ backgroundColor: isLive ? "#4a3f35" : "rgba(0,0,0,0.55)", color: "white" }}
            >
              {isLive ? "LIVE" : drop.dateLabel ?? "SOON"}
            </span>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

// Separate tile for previously released (no blur, no lock, external link to streaming)
function PreviousTile({ item }: { item: PreviousRelease }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group focus:outline-none focus:ring-2 focus:ring-[#B8A082]"
      aria-label={`${item.title} — streaming`}
      title={`${item.title} — streaming`}
    >
      <div className="rounded-2xl overflow-hidden border border-[#B8A082] bg-white/40 shadow-sm relative">
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
            <span
              className="rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold"
              style={{ backgroundColor: "#303030", color: "white" }}
            >
              STREAMING
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default function ReleasesHub() {
  const live = DROPS.find((d) => d.status === "live")
  const upcoming = DROPS.filter((d) => d.status === "upcoming")
  const later = upcoming.slice(6)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3F2EE" }}>
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
              <div className="rounded-3xl overflow-hidden border border-[#B8A082] bg-white/40 shadow">
                <ReleaseTile drop={live} />
              </div>
              <div className="rounded-3xl border border-[#B8A082] bg-[#F3F2EE]/70 p-5 md:p-6 flex flex-col justify-between">
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

      {/* Later (if >6 upcoming) */}
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

      {/* Previously Released — links to streaming */}
      {PREVIOUS_RELEASES.length > 0 && (
        <section className="mt-10 md:mt-12 px-5 pb-24">
          <h3 className="text-base md:text-lg font-semibold text-black mb-3 md:mb-4">Previously Released</h3>
          <div className="mx-auto max-w-6xl grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {PREVIOUS_RELEASES.slice(0, 3).map((item, i) => (
              <PreviousTile key={`prev-${i}`} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
