"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/primitives/button"
import { Header } from "@/components/patterns/header"
import { AlbumCover } from "@/components/patterns/album-cover"
import { Sheet } from "@/components/patterns/sheet"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { ActivityFeed } from "@/components/patterns/activity-feed"

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
  const { isPlayerVisible, currentSong } = useMusicPlayer()

  // ⬇️ UPDATED: add $100
  const presetAmounts = [5, 10, 25, 50, 100]

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
    return () => { document.body.style.overflow = "unset" }
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
    return () => { canceled = true; clearInterval(id) }
  }, [])

  const dollars = (cents: number) => Math.round(cents / 100).toString()

  const handleCheckout = () => {
    const amt = getFinalAmount()
    if (!Number.isFinite(amt) || amt < 5) {
      setCustomAmountError("Minimum amount is $5")
      return
    }
    window.location.href = `/api/checkout?amount=${encodeURIComponent(amt)}&label=${encodeURIComponent(
      "Caliphornia Support"
    )}`
  }

  return (
    <div className={`min-h-screen px-5 md:px-6 py-5 md:py-8 ${containerPaddingBottom}`} style={{ backgroundColor: "#f3f2ee" }}>
      {/* Header (centered, no back button) */}
      <div className="flex items-center justify-center mb-0">
        <Header />
      </div>

      {/* Accessible title only (no visual heading) */}
      <h1 className="sr-only">POLYGAMY</h1>

      {/* Album */}
      <div className="relative mb-4 md:mb-8">
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

      {/* Price / Progress Display */}
      <div className="text-center mb-5 md:mb-8">
        <div className="px-4 py-3 md:p-4 max-w-[640px] mx-auto" style={{ background: "rgba(212, 211, 196, 0.70)" }}>
          <div className="text-4xl md:text-5xl font-bold text-black mb-2 md:mb-4 leading-none">
            {goal ? `$${dollars(goal.remaining_cents)}` : "$99"}
          </div>
          <p className="text-xs md:text-sm font-medium" style={{ color: "#867260" }}>
            REMAINING TO UNLOCK ON STREAMING
          </p>
        </div>
      </div>

      {/* ⬇️ UPDATED: Preset Amount Buttons to fit 5 across */}
      <div className="grid grid-cols-5 gap-2 md:gap-3 mb-6 md:mb-8 max-w-[640px] mx-auto">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handleAmountSelect(amount)}
            className={`min-w-0 py-3 md:py-4 text-base md:text-xl font-bold border-2 transition-colors cursor-pointer ${
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
      <div className="mb-6 md:mb-8 max-w-[640px] mx-auto">
        <label className="block text-xs md:text-sm font-medium mb-2 md:mb-3" style={{ color: "#867260" }}>
          CUSTOM AMOUNT
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl md:text-2xl font-bold"
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
        {customAmountError && <p className="text-red-500 text-xs md:text-sm mt-2">{customAmountError}</p>}
      </div>

      {/* Checkout Button */}
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

      {/* What Do You Get — border/shadow applied to the Sheet's panel, not inner content */}
<Sheet
  isOpen={isSheetOpen}
  onClose={handleCloseSheet}
  panelClassName="rounded-t-3xl border border-[#B8A082] shadow-[0_-8px_24px_rgba(0,0,0,0.25)] bg-[#F3F2EE] max-w-2xl mx-auto"
>
  <div className="text-center px-5 pt-3 pb-5">
    <h2 className="text-xl md:text-2xl font-bold text-black mb-6">What Do You Get?</h2>

    <div className="space-y-6 text-left">
      <div>
        <p className="font-bold text-lg text-black">$5 · Apps & Vibes</p>
        <p className="text-[#4a3f35] text-sm md:text-base">
          Support the artist directly and contribute to unlocking it for streaming. Complete access
          to listen to and download full 'Polygamy' song. Play Lyric Genius game experience with
          perks if you win. Exclusive access to super-fan merch store.
        </p>
      </div>

      <div>
        <p className="font-bold text-lg text-black">$10 · Good Eats</p>
        <p className="text-[#4a3f35] text-sm md:text-base">
          Everything from Apps & Vibes, plus 10% off total merch purchase.
        </p>
      </div>

      <div>
        <p className="font-bold text-lg text-black">$25 · Signature Dish</p>
        <p className="text-[#4a3f35] text-sm md:text-base">
          Everything from Good Eats, plus an additional 10% off total merch purchase.
        </p>
      </div>

      <div>
        <p className="font-bold text-lg text-black">$50 · Chef&apos;s Special</p>
        <p className="text-[#4a3f35] text-sm md:text-base">
          Everything from Signature Dish, plus a Caliphornia Cream T-Shirt.
        </p>
      </div>

      <div>
        <p className="font-bold text-lg text-black">$100 · Five-Star Feast</p>
        <p className="text-[#4a3f35] text-sm md:text-base">
          Everything from Chef&apos;s Special, plus an exclusive limited edition signed
          &apos;Polygamy&apos; single vinyl and a Caliphornia Cream T-Shirt.
        </p>
      </div>
    </div>
  </div>
</Sheet>

    </div>
  )
}
