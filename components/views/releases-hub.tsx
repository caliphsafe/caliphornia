"use client"

import Image from "next/image"
import Link from "next/link"

type Drop = {
  slug: string
  title: string
  cover: string
  status: "live" | "upcoming"
  dateLabel?: string // e.g., "Sep 24"
  subtitle?: string
}

const DROPS: Drop[] = [
  {
    slug: "/home",
    title: "POLYGAMY",
    cover: "/polygamy-cover.png",
    status: "live",
    subtitle: "Start here",
  },
  // 11 stand-ins
  { slug: "#", title: "DROP 2", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Sep 24" },
  { slug: "#", title: "DROP 3", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 1" },
  { slug: "#", title: "DROP 4", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 8" },
  { slug: "#", title: "DROP 5", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 15" },
  { slug: "#", title: "DROP 6", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 22" },
  { slug: "#", title: "DROP 7", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Oct 29" },
  { slug: "#", title: "DROP 8", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 5" },
  { slug: "#", title: "DROP 9", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 12" },
  { slug: "#", title: "DROP 10", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 19" },
  { slug: "#", title: "DROP 11", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Nov 26" },
  { slug: "#", title: "DROP 12", cover: "/cover-placeholder.png", status: "upcoming", dateLabel: "Dec 3" },
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
        {/* Slimmer message */}
        <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed" style={{ color: "#867260" }}>
          Tune in weekly and help release Caliph’s music to streaming. Your support funds visuals, unlocks drops, and
          decides what comes next.
        </p>
      </header>

      {/* Grid (iPhone home–style) */}
      <main className="px-5 pb-24">
        <div className="mx-auto max-w-6xl grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {DROPS.map((d, i) => {
            const Card = d.status === "live" ? Link : "div"
            const cardProps =
              d.status === "live"
                ? { href: d.slug, className: "block group focus:outline-none focus:ring-2 focus:ring-[#B8A082]" }
                : { className: "block opacity-90" }

            return (
              <Card key={i} {...(cardProps as any)}>
                <div className="rounded-2xl overflow-hidden border border-[#B8A082] bg-white/40 shadow-sm">
                  <div className="relative w-full aspect-square bg-black">
                    <Image
                      src={d.cover}
                      alt={`${d.title} cover`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />

                    {/* Status chip */}
                    <div className="absolute top-2 left-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold"
                        style={{
                          backgroundColor: d.status === "live" ? "#4a3f35" : "rgba(0,0,0,0.55)",
                          color: "white",
                        }}
                      >
                        {d.status === "live" ? "LIVE" : d.dateLabel ?? "SOON"}
                      </span>
                    </div>
                  </div>

                  {/* Info — tuned for mobile visibility */}
                  <div className="px-2.5 py-2 sm:px-3 sm:py-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-[12px] sm:text-sm md:text-base font-bold text-black truncate">
                        {d.title}
                      </h3>
                      {d.subtitle ? (
                        <span
                          className="text-[10px] sm:text-xs whitespace-nowrap"
                          style={{ color: "#9f8b79" }}
                          title={d.subtitle}
                        >
                          {d.subtitle}
                        </span>
                      ) : null}
                    </div>

                    {/* Secondary line (date for upcoming) */}
                    {d.status === "upcoming" && d.dateLabel ? (
                      <p className="mt-0.5 text-[10px] sm:text-xs" style={{ color: "#9f8b79" }}>
                        Drops {d.dateLabel}
                      </p>
                    ) : null}
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
