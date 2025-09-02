"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon } from "@heroicons/react/24/solid"
import { Button } from "@/components/primitives/button"
import { Header } from "@/components/patterns/header"
import { AlbumCover } from "@/components/patterns/album-cover"
import { Sheet } from "@/components/patterns/sheet"
import { useMusicPlayer } from "@/contexts/music-player-context"

type Goal = {
  ok: boolean
  goal_cents: number
  total_cents: number
  remaining_cents: number
  percent: number
}

export function BuyView() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [customAmountError, setCustomAmountError] = useState("")
  const { isPlayerVisible, currentSong } = useMusicPlayer()

  // 🔹 CHANGED: last option from 100 → 50
  const presetAmounts = [5, 10, 25, 50]

  // 🔹 NEW: goal/progress state
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
    if (value && numValue < 5) {
      setCustomAmountError("Minimum amount is $5")
    } else {
      setCustomAmountError("")
    }
  }

  const getFinalAmount = () => {
    if (customAmount) return Number.parseFloat(customAmount) || 0
    return selectedAmount || 0
  }

  const handleWhatDoIGetClick = () => {
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
  }

  // Keep body scroll behavior for sheet as-is
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isSheetOpen])

  const isPlayerActive = isPlayerVisible && currentSong !== null
  const containerPaddingBottom = isPlayerActive ? "pb-32" : "pb-8"

  // 🔹 NEW: load goal progress (and refresh periodically)
  useEffect(() => {
    let canceled = false
    async function load() {
      try {
        const res = await fetch("/api/goal", { cache: "no-store" })
        const data = await res.json()
        if (!canceled && data?.ok) setGoal(data)
      } catch {
        // ignore; keep previous value
      }
    }
    load()
    const id = setInterval(load, 15000) // refresh every 15s
    return () => {
      canceled = true
      clearInterval(id)
    }
  }, [])

  const dollars = (cents: number) => {
    // Show whole dollars (matches your current style); change to toFixed(2) if you ever need cents.
    return Math.round(cents / 100).toString()
  }

  // 🔹 NEW: checkout handler that preserves your UX
  const handleCheckout = () => {
    const amt = getFinalAmount()
    if (!Number.isFinite(amt) || amt < 5) {
      setCustomAmountError("Minimum amount is $5")
      return
    }
    // Redirect to our checkout API (custom-amount mode). If you use Price IDs per option instead,
    // you can wire each preset button directly to /api/checkout?price_id=PRICE_... instead of using this.
    window.location.href = `/api/checkout?amount=${encodeURIComponent(amt)}&label=${encodeURIComponent(
      "Caliphornia Support"
    )}`
  }

  return (
    <div className={`min-h-screen px-6 py-8 ${containerPaddingBottom}`} style={{ backgroundColor: "#f3f2ee" }}>
      {/* Header with Back Button and Logo */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/home")}
          className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <div className="flex-1">
          <Header />
        </div>
        <div className="w-12" />
      </div>

      {/* You're Buying Text */}
      <div className="text-center mb-2">
        <p className="text-lg font-medium" style={{ color: "#9f8b79" }}>
          YOU'RE BUYING
        </p>
      </div>

      {/* Polygamy Title */}
      <div className="text-center mb-5 md:mb-8">
        <h1 className="font-bold text-black text-[32px] md:text-[48px] mb-5 md:mb-8">POLYGAMY</h1>
      </div>

      <div className="relative mb-8">
        <AlbumCover />

        {/* What Do I Get Button Overlay */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={handleWhatDoIGetClick}
            className="flex w-fit px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full text-black text-sm font-medium hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
          >
            WHAT DO I GET?
          </button>
        </div>
      </div>

      {/* Price / Progress Display (wired to /api/goal) */}
      <div className="text-center mb-8">
        <div className="p-4 max-w-[640px] mx-auto" style={{ background: "rgba(212, 211, 196, 0.70)" }}>
          <div className="text-5xl font-bold text-black mb-4">
            {/* If goal not loaded yet, show the previous static look briefly */}
            {goal ? `$${dollars(goal.remaining_cents)}` : "$99"}
          </div>
          <p className="text-sm font-medium" style={{ color: "#867260" }}>
            REMAINING TO UNLOCK ON STREAMING
          </p>
        </div>
      </div>

      {/* Preset Amount Buttons (100 → 50) */}
      <div className="grid grid-cols-4 gap-3 mb-8 max-w-[640px] mx-auto">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handleAmountSelect(amount)}
            className={`py-4 text-xl font-bold border-2 transition-colors cursor-pointer ${
              selectedAmount === amount
                ? "bg-[#867260] text-white border-[#867260]"
                : "bg-[#d4d3c4] text-[#4a3f35] border-[#bbb8a0] hover:bg-[#bbb8a0]"
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Custom Amount Section */}
      <div className="mb-8 max-w-[640px] mx-auto">
        <label className="block text-sm font-medium mb-3" style={{ color: "#867260" }}>
          CUSTOM AMOUNT
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold"
            style={{ color: "#4a3f35" }}
          >
            $
          </span>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder=""
            min="5"
            step="1"
            className={`w-full pl-12 pr-4 py-4 text-xl font-bold border-2 bg-[#f3f2ee] focus:outline-none focus:ring-2 focus:ring-[#867260] ${
              customAmountError ? "border-red-500" : "border-[#4a3f35]"
            }`}
            style={{ color: "#4a3f35" }}
          />
        </div>
        {customAmountError && <p className="text-red-500 text-sm mt-2">{customAmountError}</p>}
      </div>

      {/* Checkout Button (now links to /api/checkout with selected/custom amount) */}
      <div className="max-w-[640px] mx-auto">
        <Button
          variant="primary"
          size="large"
          className="w-full text-xl font-bold py-4"
          style={{ backgroundColor: "#4a3f35", color: "white" }}
          disabled={getFinalAmount() === 0 || (customAmount && Number.parseFloat(customAmount) < 5)}
          onClick={handleCheckout}
        >
          CHECKOUT
        </Button>
      </div>

      <Sheet isOpen={isSheetOpen} onClose={handleCloseSheet}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-6">What Do You Get?</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#9f8b79] rounded-full mt-2 flex-shrink-0" />
              <p className="text-[#4a3f35]">Exclusive access to the full track on all streaming platforms</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#9f8b79] rounded-full mt-2 flex-shrink-0" />
              <p className="text-[#4a3f35]">High-quality audio download (320kbps MP3 + FLAC)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#9f8b79] rounded-full mt-2 flex-shrink-0" />
              <p className="text-[#4a3f35]">Digital album artwork and liner notes</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#9f8b79] rounded-full mt-2 flex-shrink-0" />
              <p className="text-[#4a3f35]">Early access to future releases and exclusive content</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#9f8b79] rounded-full mt-2 flex-shrink-0" />
              <p className="text-[#4a3f35]">Support the artist directly</p>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
