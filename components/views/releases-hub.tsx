"use client"

import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/patterns/header"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { LockClosedIcon } from "@heroicons/react/24/solid"

type ReleaseItem = {
  key: string
  title: string
  date: Date
  href?: string
  cover?: string
  available: boolean
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ReleasesHub() {
  const { isPlayerVisible } = useMusicPlayer()

  // Base schedule: 12 weeks total, starting 9/17 (first is active "Polygamy")
  const start = new Date("2025-09-17T00:00:00")
  const releases: ReleaseItem[] = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i * 7)

    if (i === 0) {
      return {
        key: "polygamy",
        title: "POLYGAMY",
        date,
        href: "/home",
        cover: "/polygamy-cover.png", // uses your existing art
        available: true,
      }
    }

    return {
      key: `drop-${i + 1}`,
      title: `DROP ${i + 1}`,
      date,
      cover: "/placeholder.svg", // swap later per-release
      available: false,
    }
  })

  return (
    <div className={`min-h-screen px-6 pt-8 pb-24 ${isPlayerVisible ? "pb-40" : ""}`} style={{ backgroundColor: "#f3f2ee" }}>
      {/* Top header */}
      <div className="text-center mb-6">
        <Header />
      </div>

      {/* Page title + subtitle */}
      <div className="text-center mb-6">
        <h1 className="font-bold text-black text-[28px] md:text-[40px] tracking-tight">CALIPHORNIA</h1>
        <p className="text-sm md:text-base" style={{ color: "#9f8b79" }}>
          12 drops · one every week — start with <span className="font-semibold">POLYGAMY</span>
        </p>
      </div>

      {/* Grid like iPhone home screen: 3 columns x 4 rows */}
      <div className="max-w-[820px] mx-auto grid grid-cols-3 gap-5 md:gap-7">
        {releases.map((item) => {
          const TileInner = (
            <div
              className="group relative rounded-3xl border border-[#B8A082] shadow-[0_6px_16px_rgba(0,0,0,0.08)] overflow-hidden"
              style={{ backgroundColor: "#F3F2EE" }}
            >
              {/* Icon / cover */}
              <div className="aspect-square bg-black">
                <Image
                  src={item.cover || "/placeholder.svg"}
                  alt={item.title}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover"
                  priority={item.available}
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center">
                    <LockClosedIcon className="w-9 h-9 text-white/90" />
                  </div>
                )}
              </div>

              {/* Label area */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm md:text-base font-semibold text-black truncate">{item.title}</p>
                  {item.available ? (
                    <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#4a3f35" }}>
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#d4d3c4", color: "#4a3f35" }}>
                      SOON
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm mt-1" style={{ color: "#9f8b79" }}>
                  {formatDate(item.date)}
                </p>
              </div>

              {/* Glow on hover for desktop */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.4)" }} />
            </div>
          )

          return item.available && item.href ? (
            <Link key={item.key} href={item.href} className="focus:outline-none focus:ring-2 focus:ring-[#B8A082] rounded-3xl">
              {TileInner}
            </Link>
          ) : (
            <div key={item.key} className="cursor-not-allowed opacity-90">{TileInner}</div>
          )
        })}
      </div>

      {/* Tiny legend */}
      <div className="max-w-[820px] mx-auto mt-6 text-center">
        <p className="text-xs md:text-sm" style={{ color: "#867260" }}>
          New experience drops every week. Tap a tile when it’s LIVE.
        </p>
      </div>
    </div>
  )
}
