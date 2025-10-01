"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
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
  { slug: "/buy", title: "POLYGAMY", cover: "/polygamy-cover.png", status: "live" },
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

const PREVIOUS_RELEASES: PreviousRelease[] = [
  {
    title: "MARIA JULIA (Single)",
    cover: "/maria-julia-cover.jpg",
    links: {
      apple: "https://music.apple.com/us/album/maria-julia-single/1828692139?at=1001lry3&ct=dashboard&uo=4",
      spotify: "https://open.spotify.com/album/0tYN2jrPeKd3GvSX5ZL9GK",
      tidal: "https://tidal.com/browse/album/449886502",
      youtube: "https://www.youtube.com/watch?v=xSiBH-F6klU",
    },
  },
  {
    title: "EATER JAMES (Single)",
    cover: "/eater-james-cover.JPG",
    links: {
      apple: "https://music.apple.com/us/album/eater-james-single/1788913374?at=1001lry3&ct=dashboard&uo=4",
      spotify: "https://open.spotify.com/album/6Fifi70A9hcS7SWMXmNzjn",
      tidal: "https://tidal.com/browse/album/409282874",
      youtube: "https://www.youtube.com/watch?v=OJsX3XioJb8",
    },
  },
  {
    title: "FREE LIPH (EP)",
    cover: "/free-liph-ep-cover.jpg",
    links: {
      apple: "https://music.apple.com/us/album/free-liph/1781918994",
      spotify: "https://open.spotify.com/album/1Y4kh3SZuSyTp1Mm4xO032",
      tidal: "https://tidal.com/browse/album/401698101",
      youtube:
        "https://youtube.com/playlist?list=OLAK5uy_mxiilUPgUyGTiaWR8z6GWhShifQ7MGtZY&si=EEMpBQS-NLQZezdr",
    },
  },
]

// ---------- Style tokens ----------
const glass =
  "bg-white/55 backdrop-blur-md border border-[#B8A082]/70 shadow-[0_20px_50px_rgba(0,0,0,0.12)]"

function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
      style={{
        background:
          "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22240%22 height=%22240%22 filter=%22url(%23n)%22 opacity=%220.6%22/></svg>')",
        backgroundSize: "240px 240px",
      }}
    />
  )
}

function Chip({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold shadow-sm"
      style={{ backgroundColor: dark ? "rgba(0,0,0,0.55)" : "#4a3f35", color: "white" }}
    >
      {children}
    </span>
  )
}

const cardLift =
  "transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.16)]"

// ---------- Helpers ----------
function useMagnetic() {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)
  useEffect(() => {
    if (typeof window === "undefined") return
    const coarse = window.matchMedia("(pointer: coarse)").matches
    if (coarse) return
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10
      const y = ((e.clientY - r.top) / r.height - 0.5) * -10
      el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg)`
      el.style.boxShadow = "0 12px 36px rgba(0,0,0,0.16)"
    }
    const reset = () => {
      el.style.transform = "perspective(600px) rotateX(0) rotateY(0)"
      el.style.boxShadow = ""
    }
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", reset)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", reset)
    }
  }, [])
  return ref
}

// ---------- Tiles ----------
function ReleaseTile({ drop }: { drop: Drop }) {
  const isLive = drop.status === "live"
  const Wrapper: any = isLive ? Link : "div"
  const wrapperProps = isLive
    ? { href: drop.slug, className: "block group focus:outline-none focus:ring-2 focus:ring-[#B8A082]" }
    : { className: "block" }

  return (
    <Wrapper {...wrapperProps}>
      <div className={`relative rounded-2xl overflow-hidden ${glass} backdrop-blur-[6px] ${cardLift}`}>
        <Grain />
        <div className="relative w-full aspect-square bg-black">
          <Image
            src={drop.cover || "/cover-placeholder.png"}
            alt={`${drop.title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            loading={isLive ? "eager" : "lazy"}
            className={`object-cover ${isLive ? "" : "blur-[6px] md:blur-[16px] opacity-75 scale-110"}`}
            priority={isLive}
          />
          {!isLive && <div className="absolute inset-0 bg-[rgba(243,242,238,0.35)]" />}
          {!isLive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="backdrop-blur-sm bg-[rgba(0,0,0,0.35)] border border-[#B8A082] rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-md">
                <LockClosedIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
            <Chip dark={!isLive}>{isLive ? "LIVE" : drop.dateLabel ?? "SOON"}</Chip>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

function PreviousTile({ item, onOpen }: { item: PreviousRelease; onOpen: (r: PreviousRelease) => void }) {
  return (
    <button
      onClick={() => onOpen(item)}
      className={`block group focus:outline-none focus:ring-2 focus:ring-[#B8A082] rounded-2xl ${cardLift}`}
      aria-label={`${item.title} — streaming`}
      title={`${item.title} — streaming`}
    >
      <div className={`relative rounded-2xl overflow-hidden ${glass} backdrop-blur-[6px]`}>
        <Grain />
        <div className="relative w-full aspect-square bg-black">
          <Image
            src={item.cover || "/cover-placeholder.png"}
            alt={`${item.title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            loading="lazy"
            className="object-cover"
          />
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
            <span className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-white bg-[#303030]">
              STREAMING
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ---------- Streaming Pop-up ----------
function StreamingSheet({ open, onClose, release }: { open: boolean; onClose: () => void; release: PreviousRelease | null }) {
  if (!open || !release) return null
  const LinkBtn = ({ label, href, bg }: { label: string; href?: string; bg: string }) => (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between w-full rounded-xl px-4 py-3 font-semibold text-white shadow-sm transition ${href ? "hover:opacity-90" : "opacity-60 cursor-not-allowed"}`}
      style={{ backgroundColor: bg }}
    >
      <span>{label}</span>
      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
    </a>
  )
  return (
    <div className="fixed inset-0 z-[120]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.5)), url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.03%22/></svg>')",
          backgroundSize: "cover, 160px 160px",
        }}
        onClick={onClose}
      />
      <div className="absolute left-0 right-0 bottom-6 md:bottom-10">
        <div className={`mx-auto max-w-xl w-[92%] md:w-[72%] ${glass} rounded-3xl overflow-hidden`}>
          <Grain />
          <div className="flex items-center justify-end px-3 pt-2 pb-1">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 text-[#4a3f35]" aria-label="Close">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="px-4 pb-3 flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#B8A082] shadow">
              <Image src={release.cover} alt={`${release.title} cover`} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-black truncate">{release.title}</h3>
              <p className="text-xs" style={{ color: "#867260" }}>Listen on your favorite platform</p>
            </div>
          </div>

          <div className="px-4 pb-4 grid grid-cols-1 gap-2.5">
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

// ---------- Sticky Nav ----------
function TopNav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div
      className={`sticky top-0 z-[200] transition-all ${
        solid
          ? "backdrop-blur-md bg-white/60 border-b border-[#B8A082]/50 shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
          : "backdrop-blur-[2px] bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-center md:justify-between">
        <div className="hidden md:block w-[120px]" />
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/caliphornia-logo.svg"
            alt="CALIPHORNIA"
            width={140}
            height={32}
            className="h-auto w-[128px] md:w-[120px]"
            priority
          />
        </Link>
        <div className="hidden md:block w-[180px]" />
      </div>
    </div>
  )
}

// ---------- Feature Presentation (no parallax, eager hero only) ----------
function FeaturedCard({ live }: { live: Drop }) {
  const enterRef = useMagnetic()

  return (
    <section
      className="px-4 pt-4 pb-5 md:py-6 relative"
      style={{
        background:
          "radial-gradient(900px 360px at 50% -20%, rgba(184,160,130,0.10), transparent), linear-gradient(180deg, rgba(255,255,255,0.55), rgba(243,242,238,0))",
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="w-[70vw] max-w-[820px] aspect-[4/1] opacity-25 blur-[40px]"
          style={{ background: "url('/caliphornia-logo.svg') center/contain no-repeat" }}
        />
      </div>

      <div className="mx-auto max-w-5xl relative">
        <div className={`relative rounded-3xl overflow-hidden ${glass} backdrop-blur-[8px]`}>
          <Grain />

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,560px)_1fr] items-stretch">
            {/* padded square cover that links to /buy */}
            <div className="p-3 md:p-5">
              <Link href="/buy" className="block">
                <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden">
                  <Image
                    src={live.cover || "/cover-placeholder.png"}
                    alt={`${live.title} cover`}
                    fill
                    sizes="(max-width: 768px) 100vw, 700px"
                    loading="eager"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2"><Chip>LIVE</Chip></div>
                </div>
              </Link>
            </div>

            {/* info */}
            <div className="flex flex-col justify-between px-4 pb-4 pt-0 md:p-6 relative">
              <div>
                <div className="text-[11px] md:text-xs font-bold tracking-[0.18em] text-[#867260] uppercase">
                  THIS WEEK’S DROP
                </div>
                <h2 className="mt-1 text-lg md:text-2xl font-extrabold tracking-tight text-black">
                  POLYGAMY (PROD. BY CALIPH)
                </h2>

                <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-justify" style={{ color: "#4a3f35" }}>
                  A playful, self-aware parody on modern love and legacy, “Polygamy” threads Caliph’s single-life
                  lessons through a family lens. Across verses he compares three breakups to his grandfather’s three
                  successful marriages—as told in the third verse—turning hard-won boundaries into wit, rhythm, and
                  resolve. Produced by Caliph and sampling Monique Séka’s West African classic “Okaman,” the record
                  keeps it light while guarding the heart—meeting his needs and the women in his world with clarity.
                </p>
              </div>

              {/* Rectangular CTA (no rounded corners) */}
              <div className="mt-4">
                <Link
                  ref={enterRef as any}
                  href="/buy"
                  className="inline-flex justify-center w-full md:w-auto rounded-none px-5 py-2.5 font-semibold text-white transition will-change-transform"
                  style={{ backgroundColor: "#4a3f35" }}
                >
                  Unlock Song
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Section reveal ----------
function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === "undefined") return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    el.classList.add("opacity-0", "translate-y-3", "will-change-transform")
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.remove("opacity-0", "translate-y-3")
          el.classList.add("animate-reveal")
          io.disconnect()
        }
      })
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

// ---------- About Caliph ----------
function AboutCaliph() {
  const ref = useReveal()
  return (
    <section
      ref={ref}
      className="mt-4 md:mt-6 px-4 py-4 relative"
      style={{ background: "linear-gradient(180deg, rgba(235,230,220,0.30), rgba(243,242,238,0.7))" }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="w-[72vw] max-w-[820px] opacity-25 blur-[34px]"
          style={{ background: "url('/caliphornia-logo.svg') center/contain no-repeat", aspectRatio: "4/1" }}
        />
      </div>

      <div className="mx-auto max-w-6xl relative">
        <div className={`relative rounded-2xl overflow-hidden ${glass} backdrop-blur-[8px]`}>
          <Grain />
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
            <div className="relative min-h-[240px] md:min-h-[340px]">
              <div className="absolute inset-0">
                <Image
                  src="/caliph-profile.png"
                  alt="Caliph portrait"
                  fill
                  sizes="(max-width: 768px) 100vw, 560px"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="relative p-3 md:p-4 flex flex-col">
              <h3 className="text-base md:text-lg font-bold text-black">About Caliph</h3>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className={`relative rounded-2xl p-2.5 ${glass} backdrop-blur-[8px]`}>
                  <Grain />
                  <div className="text-[10px] font-semibold tracking-wide text-[#867260]">Hometown</div>
                  <div className="text-[13px] font-bold text-black mt-0.5">Dakar, Senegal / New England</div>
                </div>
                <div className={`relative rounded-2xl p-2.5 ${glass} backdrop-blur-[8px]`}>
                  <Grain />
                  <div className="text-[10px] font-semibold tracking-wide text-[#867260]">Genres</div>
                  <div className="text-[13px] font-bold text-black mt-0.5">Hip-Hop · Afro-Fusion · R&B</div>
                </div>
                <div className={`relative rounded-2xl p-2.5 ${glass} backdrop-blur-[8px]`}>
                  <Grain />
                  <div className="text-[10px] font-semibold tracking-wide text-[#867260]">Awards & Accolades</div>
                  <div className="text-[13px] font-bold text-black mt-0.5">Multi-Grammy Award Winning Artist</div>
                </div>
              </div>

              <p className="mt-2 text-[13px] md:text-sm leading-relaxed text-justify" style={{ color: "#4a3f35" }}>
                Caliph (pronounced <em>Cuh-Leaf</em>) is a Grammy-winning artist blending hip-hop, Afro, R&B, and world
                music into bold, genre-defying storytelling. Born in Dakar, Senegal and raised in New Bedford, MA, he
                channels the journey of a Black Muslim immigrant to explore identity, resilience, and healing—from the
                Grammy-winning <em>American Dreamers</em> to <em>Immigrant Of The Year</em>, crafting independently across
                writing, production, visuals, and code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Page ----------
export default function ReleasesHub() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activePrev, setActivePrev] = useState<PreviousRelease | null>(null)

  const live = DROPS.find((d) => d.status === "live")
  const upcoming = DROPS.filter((d) => d.status === "upcoming")

  const nextRef = useReveal()
  const prevRef = useReveal()

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background:
          "radial-gradient(1200px 520px at 50% -12%, rgba(255,255,255,0.75), rgba(243,242,238,1)), #F3F2EE",
        touchAction: "pan-y",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* global ambient glow */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[120vw] h-[110px] blur-[50px] opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(184,160,130,0.35), transparent)" }}
      />

      <TopNav />

      {/* helper copy (mobile) */}
      <header className="px-5 pt-3 pb-3 flex flex-col items-center text-center sm:hidden">
        <p className="max-w-xl text-sm leading-relaxed text-justify" style={{ color: "#867260" }}>
          Tune in weekly and help release Caliph’s music to streaming—your support decides what drops next.
        </p>
      </header>

      {/* HERO */}
      {live && <FeaturedCard live={live} />}

      {/* NEXT UP — single outline, real inner padding, no vignette */}
      <section ref={nextRef} className="mt-3 md:mt-4 py-4 relative">
        <div className="px-4 flex items-center justify-between mb-2.5">
          <h3 className="text-[15px] md:text-[17px] font-semibold text-black">Next Up</h3>
          <div className="text-xs" style={{ color: "#867260" }}>Weekly releases</div>
        </div>

        <div className="px-4">
          <div className={`mx-auto max-w-5xl relative rounded-2xl ${glass} overflow-hidden`}>
            <Grain />
            <div className="p-3 sm:p-4">
              <div
                className="overflow-x-auto snap-x snap-mandatory scrollbar-thin"
                style={{ scrollbarColor: "#9f8b79 transparent", WebkitOverflowScrolling: "touch" }}
              >
                <div className="flex gap-3 sm:gap-4 min-w-max py-2 px-2">
                  {upcoming.slice(0, 6).map((d, idx) => (
                    <div key={idx} className="w-[46vw] xs:w-[40vw] sm:w-[26vw] md:w-[180px] snap-start shrink-0">
                      <ReleaseTile drop={d} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT CALIPH */}
      <AboutCaliph />

      {/* PREVIOUSLY RELEASED */}
      {PREVIOUS_RELEASES.length > 0 && (
        <section
          ref={prevRef}
          className="mt-5 md:mt-6 px-4 pb-14 pt-4 relative"
          style={{ background: "linear-gradient(180deg, rgba(235,230,220,0.35), rgba(243,242,238,0.8))" }}
        >
          <h3 className="text-[15px] md:text-[17px] font-semibold text-black mb-3">Previously Released</h3>
          <div className="mx-auto max-w-6xl grid grid-cols-3 gap-3 sm:gap-4">
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

      <StreamingSheet open={sheetOpen} onClose={() => setSheetOpen(false)} release={activePrev} />

      {/* global CSS (NOTE: removed content-visibility to avoid Safari scroll hitch) */}
      <style jsx global>{`
        .animate-reveal { animation: revealUp 520ms cubic-bezier(.2,.7,.2,1) forwards; }
        @keyframes revealUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .animate-reveal { animation: none !important; } }

        /* small iOS polish */
        html, body { overscroll-behavior-y: none; }
      `}</style>
    </div>
  )
}
