"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid"

export function FullScreenPlayer() {
  const router = useRouter()
  const { currentSong, isPlaying, isFullScreenOpen, currentTime, duration, togglePlayPause, seekTo, closeFullScreen } =
    useMusicPlayer()

  const handleBuyClick = () => {
    closeFullScreen()
    router.push("/buy")
  }

  if (!isFullScreenOpen || !currentSong) {
    return null
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={closeFullScreen}
      />

      <div className="absolute bottom-0 left-0 right-0 h-screen md:h-auto bg-[#F3F2EE] md:rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={closeFullScreen}
            className="w-10 h-1 bg-[#9f8b79] rounded-full hover:bg-[#867260] transition-colors cursor-pointer"
          />
        </div>

        <div className="flex flex-col h-full md:h-auto px-8 pt-8 pb-8">
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

            {/* Progress Bar with Times */}
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
              <span className="text-sm" style={{ color: "#9f8b79" }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Large Play/Pause Button */}
            <div className="flex justify-center">
              <button
                onClick={togglePlayPause}
                className="p-4 hover:opacity-70 transition-opacity w-20 h-20 flex items-center justify-center cursor-pointer"
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
