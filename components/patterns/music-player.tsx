"use client"

import Image from "next/image"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { PlayIcon, PauseIcon, XMarkIcon } from "@heroicons/react/24/solid"

// MM:SS formatter
function formatMMSS(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "0:00"
  // assuming seconds; if you store ms elsewhere, divide by 1000 before passing
  const total = Math.max(0, Math.floor(Number(value)))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function MusicPlayer() {
  // NOTE: we cast to any once so we can optionally access hidePlayer if it's not in the type yet.
  const {
    currentSong,
    isPlaying,
    isPlayerVisible,
    currentTime,
    duration,
    togglePlayPause,
    seekTo,
    openFullScreen,
    hidePlayer, // <- if not present in your context, expose it or rename this to your close method
  } = useMusicPlayer() as any

  console.log("[v0] MusicPlayer render:", { isPlayerVisible, currentSong: currentSong?.title || null })

  if (!isPlayerVisible || !currentSong) {
    return null
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 rounded-lg shadow-lg border border-[#B8A082] overflow-hidden"
      style={{ backgroundColor: "#F3F2EE" }}
    >
      {/* Close (X) — top-left */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          hidePlayer?.() // if your context uses a different name, change this call
        }}
        aria-label="Close player"
        className="absolute left-2 top-2 z-50 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>

      {/* Click-to-seek progress bar */}
      <div
        className="w-full h-1 bg-gray-300 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const percentage = clickX / rect.width
          if (duration > 0) {
            seekTo(Math.floor(percentage * duration))
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

      {/* Content row */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={openFullScreen}
      >
        {/* Album Cover and Song Info */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-black border border-[#B8A082] overflow-hidden">
            <Image
              src={currentSong.albumCover || "/placeholder.svg"}
              alt={`${currentSong.title} album cover`}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-black">{currentSong.title}</h4>
            <p className="text-xs" style={{ color: "#9f8b79" }}>
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Right: time + play/pause */}
        <div className="flex items-center space-x-3">
          {/* MM:SS / MM:SS */}
          <div className="text-[11px] tabular-nums" style={{ color: "#9f8b79" }}>
            {formatMMSS(currentTime)} / {formatMMSS(duration)}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePlayPause()
            }}
            className="p-2 hover:opacity-70 transition-opacity flex items-center justify-center cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5 text-[#9f8b79]" />
            ) : (
              <PlayIcon className="w-5 h-5 text-[#9f8b79]" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
