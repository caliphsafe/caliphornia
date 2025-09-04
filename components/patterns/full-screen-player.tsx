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

      {/* Full-screen panel */}
      <div className="absolute bottom-0 left-0 right-0 h-screen md:h-auto bg-[#F3F2EE] md:rounded-t-2xl shadow-2xl">
        {/* Top bar: X button + pill */}
        <div className="relative flex justify-center pt-2 pb-1">
          <button
            onClick={closeFullScreen}
            aria-label="Close player"
            className="absolute left-3 top-1 z-10 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={closeFullScreen}
            className="w-8 h-1 bg-[#9f8b79] rounded-full hover:bg-[#867260] cursor-pointer"
            aria-label="Close"
          />
        </div>

        <div className="flex flex-col h-full md:h-auto px-5 pt-4 pb-5 space-y-5">
          {/* Album cover */}
          <div className="flex-1 flex items-center justify-center md:mb-6">
            <div className="aspect-square w-64 md:w-72 bg-black border-2 border-[#B8A082] overflow-hidden">
              <Image
                src={currentSong.albumCover || "/placeholder.svg"}
                alt={`${currentSong.title} album cover`}
                width={288}
                height={288}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Song Info + Unlock */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
                {currentSong.title}
              </h1>
              <p className="text-sm md:text-base" style={{ color: "#9f8b79" }}>
                {currentSong.artist}
              </p>
            </div>
            <button
              onClick={handleBuyClick}
              className="px-3 py-1.5 md:px-5 md:py-2 text-white text-sm md:text-base font-semibold hover:opacity-80"
              style={{ backgroundColor: "#302822" }}
            >
              UNLOCK
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center w-full">
            <span className="text-xs md:text-sm" style={{ color: "#9f8b79" }}>
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 mx-3 h-1 bg-gray-300 cursor-pointer"
              onClick={(e) => {
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
            <span className="text-xs md:text-sm" style={{ color: "#9f8b79" }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Play/Pause */}
          <div className="flex justify-center">
            <button
              onClick={togglePlayPause}
              className="p-3 hover:opacity-70 w-16 h-16 flex items-center justify-center"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseIcon className="w-10 h-10 text-[#9f8b79]" />
              ) : (
                <PlayIcon className="w-10 h-10 text-[#9f8b79]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
