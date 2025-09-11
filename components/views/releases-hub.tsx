"use client"

import Image from "next/image"
import Link from "next/link"
import { LockClosedIcon } from "@heroicons/react/24/solid"

type Drop = {
  slug: string
  title: string
  cover?: string        // ← allow optional cover for unreleased too
  status: "live" | "upcoming"
  dateLabel?: string
}

const DROPS: Drop[] = [
  {
    slug: "/home",
    title: "POLYGAMY",
    cover: "/polygamy-cover.png",
    status: "live",
  },
  // Upcomings can use a real cover (blurred) OR fall back to placeholder
  { slug: "#", title: "DROP 2",  cover: "/simp-cover.png", status: "upcoming", dateLabel: "Sep 24" },
  { slug: "#", title: "DROP 3",  cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 1"  },
  { slug: "#", title: "DROP 4",  cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 8"  },
  { slug: "#", title: "DROP 5",  cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 15" },
  { slug: "#", title: "DROP 6",  cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 22" },
  { slug: "#", title: "DROP 7",  cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 29" },
  { slug: "#", title: "DROP 8",  cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 5"  },
  { slug: "#", title: "DROP 9",  cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 12" },
  { slug: "#", title: "DROP 10", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 19" },
  { slug: "#", title: "DROP 11", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 26" },
  { slug: "#", title: "DROP 12", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Dec 3"  },
]

export default function ReleasesHub() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3F2EE" }}>
      {/* Header / Logo */}
      <header className="px-6 pt-8 pb-4 flex flex-col items-center text-center">
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

      {/* Grid (iPhone home–style) */}
      <main className="px-5 pb-24">
        <div className="mx-auto max-w-6xl grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {DROPS.map((d, i) => {
            const isLive = d.status === "live"
            const Card = isLive ? Link : "div"
            const cardProps =
              isLive
                ? { href: d.slug, className: "block group focus:outline-none focus:ring-2 focus:ring-[#B8A082]" }
                : { className: "block" }

            return (
              <Card key={i} {...(cardProps as any)}>
                <div className="rounded-2xl overflow-hidden border border-[#B8A082] bg-white/40 shadow-sm relative">
                  <div className="relative w-full aspect-square bg-black">
                    {/* Cover (blur for upcoming) */}
                    <Image
                      src={d.cover || "/cover-placeholder.png"}
                      alt={`${d.title} cover`}
                      fill
                      className={`object-cover ${isLive ? "" : "blur-[2px] opacity-80 scale-105"}`}
                      sizes="(max-width: 768px) 33vw, 200px"
                    />

                    {/* Soft veil on upcoming */}
                    {!isLive && <div className="absolute inset-0 bg-[rgba(243,242,238,0.35)]" />}

                    {/* Designed lock badge (centered) for upcoming */}
                    {!isLive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="backdrop-blur-sm bg-[rgba(0,0,0,0.35)] border border-[#B8A082] rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-md">
                          <LockClosedIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Status chip (date for upcoming, LIVE for live) */}
                    <div className="absolute top-2 left-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold"
                        style={{
                          backgroundColor: isLive ? "#4a3f35" : "rgba(0,0,0,0.55)",
                          color: "white",
                        }}
                      >
                        {isLive ? "LIVE" : d.dateLabel ?? "SOON"}
                      </span>
                    </div>
                  </div>

                  {/* Info row — title only (no duplicate date) */}
                  <div className="px-2.5 py-2 sm:px-3 sm:py-3">
                    <h3 className="text-[12px] sm:text-sm md:text-base font-bold text-black truncate">
                      {d.title}
                    </h3>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
