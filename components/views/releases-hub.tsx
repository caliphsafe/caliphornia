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
  { slug: "/home", title: "POLYGAMY", cover: "/polygamy-cover.png", status: "live" },
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

// ---------- tiny bits ----------
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

function useMagnetic() {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)
  useEffect(() => {
    if (typeof window === "undefined") return
    const coarse = window.matchMedia("(pointer: coarse)").matches
    if (coarse) return // no tilt on touch
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width - 0.5) * 12
      const y = ((e.clientY - r.top) / r.height - 0.5) * -12
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
      <div className={`rounded-2xl overflow-hidden border border-[#B8A082]/70 bg-white/30 relative backdrop-blur-[2px] shadow-[0_8px_24px_rgba(0,0,0,0.10)] ${cardLift}`}>
        <div className="relative w-full aspect-square bg-black">
          <Image
            src={drop.cover || "/cover-placeholder.png"}
            alt={`${drop.title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className={`object-cover ${isLive ? "" : "blur-[3px] md:blur-[12px] opacity-80 scale-105"}`}
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
      <div className="rounded-2xl overflow-hidden border border-[#B8A082]/70 bg-white/30 relative backdrop-blur-[2px] shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
        <div className="relative w-full aspect-square bg-black">
          <Image
            src={item.cover || "/cover-placeholder.png"}
            alt={`${item.title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
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

// ---------- Bottom Sheet ----------
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
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto max-w-xl w-[92%] md:w-[72%] bg-[#F3F2EE] border border-[#B8A082] rounded-t-3xl shadow-[0_-18px_50px_rgba(0,0,0,0.28)] overflow-hidden">
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

// ---------- Feature Presentation (futuristic) ----------
function FeaturedCard({ live }: { live: Drop }) {
  const imgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = imgRef.current
    if (!el || typeof window === "undefined") return
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (coarse || reduced) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0
        const t = Math.min(16, Math.max(0, y * 0.1))
        el.style.transform = `translate3d(0, ${t}px, 0)`
        raf = 0
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const enterRef = useMagnetic()
  const supportRef = useMagnetic()

  return (
    <section
      className="px-4 pt-4 pb-5 md:py-6 relative"
      style={{
        background:
          "radial-gradient(900px 360px at 50% -20%, rgba(184,160,130,0.10), transparent), linear-gradient(180deg, rgba(255,255,255,0.55), rgba(243,242,238,0))",
      }}
    >
      {/* blurred logo backdrop for the hero */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[70vw] max-w-[820px] aspect-[4/1] opacity-25 blur-[40px]"
             style={{ background: "url('/caliphornia-logo.svg') center/contain no-repeat" }} />
      </div>

      <div className="mx-auto max-w-5xl relative">
        {/* avant-garde glass frame with subtle angle stripes */}
        <div className="rounded-3xl border border-[#B8A082]/70 bg-white/55 shadow-[0_24px_60px_rgba(0,0,0,0.14)] backdrop-blur-md overflow-hidden relative">
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]"
               style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 8px)" }} />

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,560px)_1fr] items-stretch">
            {/* Full cover */}
            <div ref={imgRef} className="relative w-full aspect-[1/1] md:h-full md:aspect-auto md:min-h-[420px] bg-black will-change-transform">
              <Image
                src={live.cover || "/cover-placeholder.png"}
                alt={`${live.title} cover`}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
                priority
              />
              <div className="absolute top-2 left-2"><Chip>LIVE</Chip></div>
              {/* neon corner accents */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#B8A082]/70 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#B8A082]/70 rounded-br-3xl" />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between p-4 md:p-6 relative">
              {/* floating glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full blur-[60px] opacity-40"
                   style={{ background: "radial-gradient(circle, rgba(184,160,130,0.55), transparent 60%)" }} />
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-black">This Week’s Drop</h2>
                <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed" style={{ color: "#4a3f35" }}>
                  Jump in, fund the run, and push this record to streaming. Your momentum here shapes what gets visuals
                  and what drops next.
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="text-[11px] font-semibold tracking-wide text-[#867260]">FEATURED</div>
                  <div className="text-base md:text-lg font-bold text-black truncate">{live.title}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Link
                  ref={enterRef as any}
                  href="/home"
                  className="text-center rounded-full px-4 py-2.5 font-semibold text-white transition will-change-transform"
                  style={{ backgroundColor: "#4a3f35" }}
                >
                  Enter Drop
                </Link>
                <Link
                  ref={supportRef as any}
                  href="/buy"
                  className="text-center rounded-full px-4 py-2.5 font-semibold border border-[#B8A082] hover:bg-black/5 transition will-change-transform"
                  style={{ color: "#4a3f35" }}
                >
                  Support
                </Link>
              </div>
            </div>
          </div>

          {/* subtle inner “carve” for hero frame */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl"
               style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -20px 40px rgba(0,0,0,0.06)" }} />
        </div>
      </div>
    </section>
  )
}

// ---------- Section Reveal ----------
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

// ---------- Page ----------
export default function ReleasesHub() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activePrev, setActivePrev] = useState<PreviousRelease | null>(null)

  const live = DROPS.find((d) => d.status === "live")
  const upcoming = DROPS.filter((d) => d.status === "upcoming")

  const nextRef = useReveal()
  const aboutRef = useReveal()
  const prevRef = useReveal()

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background:
          "radial-gradient(1200px 520px at 50% -12%, rgba(255,255,255,0.75), rgba(243,242,238,1)), #F3F2EE",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[120vw] h-[110px] blur-[50px] opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(184,160,130,0.35), transparent)" }}
      />

      {/* Sticky nav */}
      <TopNav />

      {/* Mobile helper copy */}
      <header className="px-5 pt-3 pb-3 flex flex-col items-center text-center sm:hidden">
        <p className="max-w-xl text-sm leading-relaxed" style={{ color: "#867260" }}>
          Tune in weekly and help release Caliph’s music to streaming—your support decides what drops next.
        </p>
      </header>

      {/* Feature Presentation */}
      {live && <FeaturedCard live={live} />}

      {/* Next Up — “carved-in” carousel with gaussian side fades */}
      <section
        ref={nextRef}
        className="mt-3 md:mt-4 py-5 relative"
      >
        <div className="px-4 flex items-center justify-between mb-3">
          <h3 className="text-[15px] md:text-[17px] font-semibold text-black">Next Up</h3>
          <div className="text-xs" style={{ color: "#867260" }}>Weekly releases</div>
        </div>

        {/* carved frame */}
        <div className="px-4">
          <div
            className="mx-auto max-w-6xl relative rounded-3xl overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(240,236,228,0.65), rgba(243,242,238,0.55))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -30px 40px rgba(0,0,0,0.06), 0 18px 40px rgba(0,0,0,0.08)",
            }}
          >
            {/* side gaussian fades (sit ABOVE images) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 z-10"
                 style={{ background: "linear-gradient(90deg, rgba(243,242,238,0.95), rgba(243,242,238,0))", filter: "blur(2px)" }} />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 z-10"
                 style={{ background: "linear-gradient(-90deg, rgba(243,242,238,0.95), rgba(243,242,238,0))", filter: "blur(2px)" }} />

            {/* scroller */}
            <div
              className="overflow-x-auto snap-x snap-mandatory scrollbar-thin"
              style={{ scrollbarColor: "#9f8b79 transparent" }}
            >
              <div className="flex gap-3 sm:gap-4 min-w-max pr-3 pl-3 py-3">
                {upcoming.slice(0, 6).map((d, idx) => (
                  <div key={idx} className="w-[56vw] xs:w-[44vw] sm:w-[30vw] md:w-[210px] snap-start shrink-0">
                    <ReleaseTile drop={d} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Caliph — dynamic reveal with blurred background logo */}
      <section
        ref={aboutRef}
        className="mt-6 md:mt-8 px-4 py-6 relative"
        style={{ background: "linear-gradient(180deg, rgba(235,230,220,0.35), rgba(243,242,238,0.75))" }}
      >
        {/* blurred logo backdrop */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[78vw] max-w-[900px] opacity-25 blur-[38px]"
               style={{ background: "url('/caliphornia-logo.svg') center/contain no-repeat", aspectRatio: "4/1" }} />
        </div>

        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[340px_1fr] gap-5 md:gap-7 items-start relative">
          {/* Portrait — replace src with the one used on your email gate page */}
          <div className="rounded-2xl overflow-hidden border border-[#B8A082]/70 bg-white/60 backdrop-blur-sm shadow-[0_14px_36px_rgba(0,0,0,0.12)]">
            <div className="relative w-full aspect-[4/5] bg-black">
              <Image
                src="/caliph-portrait.jpg" /* <-- swap to your real path from the email gate page */
                alt="Caliph portrait"
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Copy */}
          <div className="rounded-2xl border border-[#B8A082]/70 bg-white/60 backdrop-blur-sm p-4 md:p-6 shadow-[0_14px_36px_rgba(0,0,0,0.12)]">
            <h3 className="text-lg md:text-xl font-bold text-black">About Caliph</h3>
            <p className="mt-2 text-sm md:text-[15px]" style={{ color: "#4a3f35" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
              mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class
              aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales
              ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.
            </p>
            <p className="mt-3 text-sm md:text-[15px]" style={{ color: "#4a3f35" }}>
              In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc
              egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa.
            </p>
          </div>
        </div>
      </section>

      {/* Previously Released — compact grid */}
      {PREVIOUS_RELEASES.length > 0 && (
        <section
          ref={prevRef}
          className="mt-6 md:mt-8 px-4 pb-16 pt-5 relative"
          style={{
            background:
              "linear-gradient(180deg, rgba(235,230,220,0.40), rgba(243,242,238,0.8))",
          }}
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

      {/* global CSS for reveals */}
      <style jsx global>{`
        .animate-reveal {
          animation: revealUp 520ms cubic-bezier(.2,.7,.2,1) forwards;
        }
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-reveal { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
