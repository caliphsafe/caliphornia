"use client"

import Image from "next/image"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid"

export function MusicPlayer() {
  const { currentSong, isPlaying, isPlayerVisible, currentTime, duration, togglePlayPause, seekTo, openFullScreen } =
    useMusicPlayer()

  console.log("[v0] MusicPlayer render:", { isPlayerVisible, currentSong: currentSong?.title || null })

  if (!isPlayerVisible || !currentSong) {
    return null
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 rounded-lg shadow-lg border border-[#B8A082] overflow-hidden cursor-pointer"
      style={{ backgroundColor: "#F3F2EE" }}
      onClick={openFullScreen}
    >
      <div
        className="w-full h-1 bg-gray-300 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const percentage = clickX / rect.width
          seekTo(Math.floor(percentage * duration))
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

      <div className="flex items-center justify-between px-4 py-3">
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

        {/* Play/Pause Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePlayPause()
          }}
          className="p-2 hover:opacity-70 transition-opacity flex items-center justify-center cursor-pointer"
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5 text-[#9f8b79]" />
          ) : (
            <PlayIcon className="w-5 h-5 text-[#9f8b79]" />
          )}
        </button>
      </div>
    </div>
  )
}
