// components/patterns/play-button.tsx
"use client"

import React from "react"
import { useMusicPlayer } from "@/contexts/music-player-context"

type Song = {
  id: string
  title: string
  artist: string
  albumCover?: string
}

type PlayButtonProps = {
  song: Song
  /**
   * Optional: force a specific audio URL (e.g. full-track) instead of whatever
   * your player/registry would normally resolve for this song.id.
   * If omitted, behavior is unchanged from before.
   */
  src?: string
  /** Optional className so pages can style this exactly as before */
  className?: string
}

export function PlayButton({ song, src, className }: PlayButtonProps) {
  const { playTrack, isPlaying, currentSong } = useMusicPlayer()

  const isThisSong = currentSong?.id === song.id
  const playing = isThisSong && isPlaying

  const handleClick = () => {
    // Start (or re-start) this track. No styling changes, no seek call.
    playTrack({
      id: song.id,
      title: song.title,
      artist: song.artist,
      cover: song.albumCover,
      // If provided, use the explicit source (e.g., full track on /buy),
      // otherwise fall back to your existing registry/lookup behavior.
      src,
      // If your implementation supports it, you can add startAt: 0 safely.
      // startAt: 0,
    })
  }

  return (
    <button
      type="button"
      aria-label={playing ? "Pause" : "Play"}
      onClick={handleClick}
      // No forced visual styles here — use whatever classes you used before.
      className={className}
    >
      {/* Minimal icon-only UI so prior page styling remains in control */}
      {!playing ? (
        // Play icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        // Pause icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      )}
    </button>
  )
}
