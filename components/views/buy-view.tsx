"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon } from "@heroicons/react/24/solid"
import { Button } from "@/components/primitives/button"
import { Header } from "@/components/patterns/header"
import { AlbumCover } from "@/components/patterns/album-cover"
import { Sheet } from "@/components/patterns/sheet"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { ActivityFeed } from "@/components/patterns/activity-feed" // ⬅️ NEW

export function BuyView() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [customAmountError, setCustomAmountError] = useState("")
  const { isPlayerVisible, currentSong } = useMusicPlayer()

  const presetAmounts = [5, 10, 25, 50] // (you said $50 instead of $100)

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

      {/* Options Title */}
      <div className="text-center mb-5 md:mb-8">
        <h1 className="font-bold text-black text-[32px] md:text-[48px] mb-5 md:mb-8">OPTIONS</h1>
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

      {/* Price Display */}
      <div className="text-center mb-8">
        <div className="p-4 max-w-[640px] mx-auto" style={{ background: "rgba(212, 211, 196, 0.70)" }}>
          <div className="text-5xl font-bold text-black mb-4">$99</div>
          <p className="text-sm font-medium" style={{ color: "#867260" }}>
            REMAINING TO UNLOCK ON STREAMING
          </p>
        </div>
      </div>

      {/* Preset Amount Buttons */}
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

      {/* Checkout Button */}
      <div className="max-w-[640px] mx-auto">
        <Button
          variant="primary"
          size="large"
          className="w-full text-xl font-bold py-4"
          style={{ backgroundColor: "#4a3f35", color: "white" }}
          disabled={getFinalAmount() === 0 || (customAmount && Number.parseFloat(customAmount) < 5)}
        >
          CHECKOUT
        </Button>
      </div>

      {/* ⬇️ Activity feed under the checkout button */}
      <div className="max-w-[640px] mx-auto mt-8 mb-4">
        <ActivityFeed />
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
