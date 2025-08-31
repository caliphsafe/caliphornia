"use client"

import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { useMusicPlayer } from "@/contexts/music-player-context"
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid"

interface PlayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  song?: {
    id: string
    title: string
    artist: string
    albumCover: string
    audioUrl?: string
  }
}

const PlayButton = forwardRef<HTMLButtonElement, PlayButtonProps>(({ className, song, ...props }, ref) => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = useMusicPlayer()

  const handleClick = () => {
    if (song) {
      if (currentSong?.id === song.id) {
        // If same song is playing, toggle play/pause
        togglePlayPause()
      } else {
        // If different song or no song playing, play new song
        playSong(song)
      }
    }
  }

  const isCurrentlyPlaying = currentSong?.id === song?.id && isPlaying

  return (
    <button
      className={cn(
        "w-10 h-10 hover:opacity-70 transition-opacity flex items-center justify-center cursor-pointer",
        className,
      )}
      ref={ref}
      onClick={handleClick}
      {...props}
    >
      {isCurrentlyPlaying ? (
        <PauseIcon className="w-6 h-6 text-[#9f8b79]" />
      ) : (
        <PlayIcon className="w-6 h-6 text-[#9f8b79]" />
      )}
    </button>
  )
})

PlayButton.displayName = "PlayButton"

export { PlayButton }
