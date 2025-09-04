"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { PlayIcon, PauseIcon, XMarkIcon } from "@heroicons/react/24/solid"

export function FullScreenPlayer() {
  const router = useRouter()
  const {
    currentSong,
    isPlaying,
    isFullScreenOpen,
    currentTime,
    duration,
    togglePlayPause,
    seekTo,
    closeFullScreen,
  } = useMusicPlayer()

  const handleBuyClick = () => {
    closeFullScreen()
    router.push("/buy")
  }

  if (!isFullScreenOpen || !currentSong) {
    return null
  }

  const formatTime = (value: number | undefined | null) => {
    if (value == null || Number.isNaN(Number(value))) return "0:00"
    const secsInt = Math.max(0, Math.floor(Number(value))) // ensure whole seconds
    const mins = Math.floor(secsInt / 60)
    const secs = secsInt % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (Math.max(0, Math.floor(currentTime)) / Math.floor(duration)) * 100 : 0

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={closeFullScreen}
      />

      {/* Bottom sheet / full-screen panel */}
      <div className="absolute bottom-0 left-0 right-0 h-screen md:h-auto bg-[#F3F2EE] md:rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Top bar: grab handle + X close */}
        <div className="relative flex justify-center pt-3 pb-2">
          {/* X close button (top-left) */}
          <button
            onClick={closeFullScreen}
            aria-label="Close player"
            className="absolute left-4 top-2 z-10 w-9 h-9 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* pill/handle */}
          <button
            onClick={closeFullScreen}
            className="w-10 h-1 bg-[#9f8b79] rounded-full hover:bg-[#867260] transition-colors cursor-pointer"
            aria-label="Close"
          />
        </div>

        <div className="flex flex-col h-full md:h-auto px-8 pt-6 pb-8">
          <div className="flex-1 flex items-center justify-center md:flex-none md:mb-8">
            <div className="aspect-square max-w-full max-h-full w-full md:w-80 md:h-80 bg-black border-2 border-[#B8A082] overflow-hidden">
              <Image
                src={currentSong.albumCover || "/placeholder.svg"}
                alt={`${currentSong.title} album cover`}
                width={320}
                height={320}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-shrink-0 space-y-6 md:space-y-8">
            {/* Song Info and Buy Button */}
            <div className="flex items-center justify-between w-full">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">{currentSong.title}</h1>
                <p className="text-lg md:text-xl" style={{ color: "#9f8b79" }}>
                  {currentSong.artist}
                </p>
              </div>
              <button
                onClick={handleBuyClick}
                className="px-4 py-2 md:px-6 md:py-3 text-white font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                style={{ backgroundColor: "#302822" }}
              >
                UNLOCK
              </button>
            </div>

            {/* Progress Bar with Times (MM:SS) */}
            <div className="flex items-center justify-between w-full">
              <span className="text-sm" style={{ color: "#9f8b79" }}>
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 mx-4 h-1 bg-gray-300 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const percentage = clickX / rect.width
                  if (duration > 0) {
                    const target = Math.floor(percentage * duration)
                    seekTo(target)
                  }
                }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: "#9f8b79",
                  }}
                />
              </div>
              <span className="text-sm" style={{ color: "#9f8b79" }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Large Play/Pause Button */}
            <div className="flex justify-center">
              <button
                onClick={togglePlayPause}
                className="p-4 hover:opacity-70 transition-opacity w-20 h-20 flex items-center justify-center cursor-pointer"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <PauseIcon className="w-12 h-12 text-[#9f8b79]" />
                ) : (
                  <PlayIcon className="w-12 h-12 text-[#9f8b79]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
