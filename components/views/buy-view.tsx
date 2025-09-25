"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/primitives/button"
import { Header } from "@/components/patterns/header"
import { AlbumCover } from "@/components/patterns/album-cover"
import { Sheet } from "@/components/patterns/sheet"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { ActivityFeed } from "@/components/patterns/activity-feed"
import { MusicPlayer } from "@/components/patterns/music-player"
import { PlayIcon } from "@heroicons/react/24/solid"

// ⬇️ Dev unlock amount (set NEXT_PUBLIC_DEV_UNLOCK_AMOUNT in Vercel to enable; leave blank/0 to disable)
const DEV_UNLOCK_AMOUNT = Number(process.env.NEXT_PUBLIC_DEV_UNLOCK_AMOUNT || "0") || 0

type Goal = {
  ok: boolean
  goal_cents: number
  total_cents: number
  remaining_cents: number
  percent: number
}

export function BuyView() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [customAmountError, setCustomAmountError] = useState("")
  const { isPlayerVisible, currentSong, playTrack } = useMusicPlayer()

  // ⬇️ REVERTED: remove $100, cap at $50
  const presetAmounts = [5, 10, 25, 50]

  const [goal, setGoal] = useState<Goal | null>(null)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
    setCustomAmountError("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
    const numValue = Number.parseFloat(value)
    if (value && numValue < 5) setCustomAmountError("Minimum amount is $5")
    else setCustomAmountError("")
  }

  const getFinalAmount = () => (customAmount ? Number.parseFloat(customAmount) || 0 : selectedAmount || 0)

  const handleWhatDoIGetClick = () => setIsSheetOpen(true)
  const handleCloseSheet = () => setIsSheetOpen(false)

  useEffect(() => {
    if (isSheetOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isSheetOpen])

  const isPlayerActive = isPlayerVisible && currentSong !== null
  const containerPaddingBottom = isPlayerActive ? "pb-28 md:pb-32" : "pb-6 md:pb-8"

  useEffect(() => {
    let canceled = false
    async function load() {
      try {
        const res = await fetch("/api/goal", { cache: "no-store" })
        const data = await res.json()
        if (!canceled && data?.ok) setGoal(data)
      } catch {}
    }
    load()
    const id = setInterval(load, 15000)
    return () => {
      canceled = true
      clearInterval(id)
    }
  }, [])

  const dollars = (cents: number) => Math.round(cents / 100).toString()

  const handleCheckout = () => {
    const amt = getFinalAmount()

    // ⬇️ Dev unlock path — if the custom amount EXACTLY equals the secret amount, skip Stripe
    if (DEV_UNLOCK_AMOUNT > 0 && customAmount && Number(customAmount) === DEV_UNLOCK_AMOUNT) {
      // Set supporter cookie for 1 year and go to /download
      document.cookie = "supporter=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure"
      window.location.href = "/download"
      return
    }

    if (!Number.isFinite(amt) || amt < 5) {
      setCustomAmountError("Minimum amount is $5")
      return
    }
    window.location.href = `/api/checkout?amount=${encodeURIComponent(amt)}&label=${encodeURIComponent(
      "Caliphornia Support"
    )}`
  }

  // ⬇️ Play full-song (same behavior as home, but using full track)
  const handlePlayFull = () => {
    playTrack({
      src: "/full/polygamy.mp3", // FULL song URL (Supabase/Firebase/asset)
      title: "POLYGAMY",
      artist: "Caliph",          // if your player shows artist; safe to include
      cover: "/polygamy-cover.png",
    })
  }

  return (
    <div
      className={`min-h-screen px-5 md:px-6 py-5 md:py-8 ${containerPaddingBottom}`}
      style={{ backgroundColor: "#f3f2ee" }}
    >
      {/* Header (centered, no back button) */}
      <div className="flex items-center justify-center mb-0">
        <Header />
      </div>

      {/* Accessible title only */}
      <h1 className="sr-only">POLYGAMY</h1>

      {/* Album */}
      <div className="relative mb-3 md:mb-4">
        <AlbumCover />
        {/* What Do I Get Button Overlay */}
        <div className="absolute bottom-4 md:bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={handleWhatDoIGetClick}
            className="flex w-fit px-5 md:px-6 py-2 md:py-3 bg-white/90 backdrop-blur-sm rounded-full text-black text-xs md:text-sm font-medium hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
          >
            WHAT DO I GET?
          </button>
        </div>
      </div>

      {/* === Play Row (match /home layout: left text, right small play icon) === */}
      <div className="max-w-[640px] mx-auto mb-4 md:mb-6">
        <div
          className="flex items-center justify-between px-4 py-3 md:px-5 md:py-3 rounded-lg border border-[#B8A082]/70 bg-white/70 backdrop-blur-sm"
        >
          {/* Left: title + artist (tight, like home) */}
          <div className="min-w-0">
            <div className="text-sm md:text-base font-extrabold text-black leading-tight truncate">
              POLYGAMY
            </div>
            <div className="text-[11px] md:text-xs font-medium" style={{ color: "#4a3f35" }}>
              Caliph
            </div>
          </div>

          {/* Right: small circular play icon */}
          <button
            onClick={handlePlayFull}
            aria-label="Play full song"
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#B8A082] bg-[#4a3f35] text-white hover:opacity-90 transition"
          >
            <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Price / Progress Display */}
      <div className="text-center mb-5 md:mb-8">
        <div
          className="px-4 py-3 md:p-4 max-w-[640px] mx-auto"
          style={{ background: "rgba(212, 211, 196, 0.70)" }}
        >
          <div className="text-4xl md:text-5xl font-bold text-black mb-2 md:mb-4 leading-none">
            {goal ? `$${dollars(goal.remaining_cents)}` : "$99"}
          </div>
          <p className="text-xs md:text-sm font-medium" style={{ color: "#867260" }}>
            REMAINING TO UNLOCK ON STREAMING
          </p>
        </div>
      </div>

      {/* Preset amounts */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8 max-w-[640px] mx-auto">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handleAmountSelect(amount)}
            className={`py-3 md:py-4 text-lg md:text-xl font-bold border-2 transition-colors cursor-pointer ${
              selectedAmount === amount
                ? "bg-[#867260] text-white border-[#867260]"
                : "bg-[#d4d3c4] text-[#4a3f35] border-[#bbb8a0] hover:bg-[#bbb8a0]"
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-6 md:mb-8 max-w-[640px] mx-auto">
        <label
          className="block text-xs md:text-sm font-medium mb-2 md:mb-3"
          style={{ color: "#867260" }}
        >
          CUSTOM AMOUNT
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-bold"
            style={{ color: "#4a3f35" }}
          >
            $
          </span>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            min="5"
            step="1"
            className={`w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 text-lg md:text-xl font-bold border-2 bg-[#f3f2ee] focus:outline-none focus:ring-2 focus:ring-[#867260] ${
              customAmountError ? "border-red-500" : "border-[#4a3f35]"
            }`}
            style={{ color: "#4a3f35" }}
          />
        </div>
        {customAmountError && (
          <p className="text-red-500 text-xs md:text-sm mt-2">{customAmountError}</p>
        )}
      </div>

      {/* Checkout */}
      <div className="max-w-[640px] mx-auto">
        <Button
          variant="primary"
          size="large"
          className="w-full text-lg md:text-xl font-bold py-3 md:py-4"
          style={{ backgroundColor: "#4a3f35", color: "white" }}
          disabled={getFinalAmount() === 0 || (customAmount && Number.parseFloat(customAmount) < 5)}
          onClick={handleCheckout}
        >
          CHECKOUT
        </Button>
      </div>

      {/* Activity Feed */}
      <div className="max-w-[640px] mx-auto mt-6 md:mt-10">
        <ActivityFeed />
      </div>

      {/* What Do You Get — panel width limited to ~2/3 on desktop */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        panelClassName="rounded-t-3xl border border-[#B8A082] shadow-[0_-8px_24px_rgba(0,0,0,0.25)] bg-[#F3F2EE] w-[66vw] max-w-[66vw] mx-auto"
      >
        <div className="text-center px-4 md:px-5 pt-3 pb-5 max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg md:text-2xl font-bold text-black mb-4 md:mb-6">What Do You Get?</h2>

          {/* 2×2 menu grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 text-left">
            {/* $5 — Supporter */}
            <div className="rounded-xl border border-[#B8A082]/70 bg-white/60 p-3 md:p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm md:text-base font-semibold text-black">Supporter</h3>
                <span
                  className="shrink-0 inline-block rounded-full px-2.5 py-1 text-xs md:text-sm font-bold text-white"
                  style={{ backgroundColor: "#4a3f35" }}
                >
                  $5
                </span>
              </div>
              <p className="mt-2 text-[#4a3f35] text-xs md:text-sm leading-snug">
                Support the release and help bring 'Polygamy' to streaming. Enjoy full song access, download it, play
                Lyric Genius, and step into the super-fan merch store.
              </p>
            </div>

            {/* $10 — Fan */}
            <div className="rounded-xl border border-[#B8A082]/70 bg-white/60 p-3 md:p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm md:text-base font-semibold text-black">Fan</h3>
                <span
                  className="shrink-0 inline-block rounded-full px-2.5 py-1 text-xs md:text-sm font-bold text-white"
                  style={{ backgroundColor: "#4a3f35" }}
                >
                  $10
                </span>
              </div>
              <p className="mt-2 text-[#4a3f35] text-xs md:text-sm leading-snug">
                Back Polygamy and unlock streaming. Get the full track to listen and download, compete in Lyric Genius, and
                shop the exclusive merch store with <span className="font-medium">10% off</span> your order.
              </p>
            </div>

            {/* $25 — Superfan */}
            <div className="rounded-xl border border-[#B8A082]/70 bg-white/60 p-3 md:p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm md:text-base font-semibold text-black">Superfan</h3>
                <span
                  className="shrink-0 inline-block rounded-full px-2.5 py-1 text-xs md:text-sm font-bold text-white"
                  style={{ backgroundColor: "#4a3f35" }}
                >
                  $25
                </span>
              </div>
              <p className="mt-2 text-[#4a3f35] text-xs md:text-sm leading-snug">
                Push Polygamy closer to streaming. Download and enjoy the full song, test your skills in Lyric Genius, and
                grab exclusive merch with a <span className="font-medium">20% discount</span>.
              </p>
            </div>

            {/* $50 — Legend */}
            <div className="rounded-xl border border-[#B8A082]/70 bg-white/60 p-3 md:p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm md:text-base font-semibold text-black">Legend</h3>
                <span
                  className="shrink-0 inline-block rounded-full px-2.5 py-1 text-xs md:text-sm font-bold text-white"
                  style={{ backgroundColor: "#4a3f35" }}
                >
                  $50
                </span>
              </div>
              <p className="mt-2 text-[#4a3f35] text-xs md:text-sm leading-snug">
                Unlock Polygamy and everything that comes with it: the full track, Lyric Genius, exclusive merch access, plus
                a <span className="font-medium">free Caliphornia Cream T-Shirt</span>.
              </p>
            </div>
          </div>
        </div>
      </Sheet>

      {/* Global Music Player (same component used on Home) */}
      <MusicPlayer />
    </div>
  )
}
