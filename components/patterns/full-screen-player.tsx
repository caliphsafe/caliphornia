"use client"

import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid"

export function FullScreenPlayer() {
  const router = useRouter()
  const pathname = usePathname()
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

  if (!isFullScreenOpen || !currentSong) return null

  const formatTime = (value: number | undefined | null) => {
    if (value == null || Number.isNaN(Number(value))) return "0:00"
    const secsInt = Math.max(0, Math.floor(Number(value)))
    const mins = Math.floor(secsInt / 60)
    const secs = secsInt % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage =
    duration > 0 ? (Math.max(0, Math.floor(currentTime)) / Math.floor(duration)) * 100 : 0

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={closeFullScreen}
      />

      {/* Two-thirds bottom sheet with rounded corners, border, shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-[66vh] md:h-[600px] bg-[#F3F2EE] rounded-t-3xl border border-[#B8A082] shadow-[0_-8px_24px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Top pill handle */}
        <div className="flex justify-center pt-2 pb-1">
          <button
            onClick={closeFullScreen}
            className="w-10 h-1 bg-[#9f8b79] rounded-full hover:bg-[#867260] cursor-pointer"
            aria-label="Close"
          />
        </div>

        {/* Content */}
        <div className="h-[calc(100%-28px)] px-5 pt-2 pb-3 grid grid-rows-[auto_auto_auto_auto] gap-3">
          {/* Album cover */}
          <div className="flex justify-center">
            <div
              className="bg-black border-2 border-[#B8A082] overflow-hidden shadow-md"
              style={{
                width: "min(40vh, 72vw, 320px)",
                height: "min(40vh, 72vw, 320px)",
                aspectRatio: "1 / 1",
              }}
            >
              <Image
                src={currentSong.albumCover || "/placeholder.svg"}
                alt={`${currentSong.title} album cover`}
                width={320}
                height={320}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Song Info + Unlock (hidden on /download) */}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-black truncate">
                {currentSong.title}
              </h1>
              <p className="text-sm md:text-base truncate" style={{ color: "#9f8b79" }}>
                {currentSong.artist}
              </p>
            </div>
            {pathname !== "/download" && (
              <button
                onClick={handleBuyClick}
                className="px-3 py-1.5 md:px-5 md:py-2 text-white text-sm md:text-base font-semibold hover:opacity-80 shadow-sm"
                style={{ backgroundColor: "#302822" }}
              >
                UNLOCK
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="flex items-center">
            <span className="text-xs md:text-sm tabular-nums" style={{ color: "#9f8b79" }}>
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 mx-2 h-1 bg-gray-300 cursor-pointer rounded-full"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const percentage = clickX / rect.width
                if (duration > 0) seekTo(Math.floor(percentage * duration))
              }}
            >
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%`, backgroundColor: "#9f8b79" }}
              />
            </div>
            <span className="text-xs md:text-sm tabular-nums" style={{ color: "#9f8b79" }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Play/Pause */}
          <div className="flex justify-center">
            <button
              onClick={togglePlayPause}
              className="p-3 hover:opacity-70 w-16 h-16 flex items-center justify-center rounded-full bg-white border border-[#B8A082] shadow-md"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseIcon className="w-9 h-9 text-[#9f8b79]" />
              ) : (
                <PlayIcon className="w-9 h-9 text-[#9f8b79]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
