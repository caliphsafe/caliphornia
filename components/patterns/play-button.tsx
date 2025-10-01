// components/patterns/play-button.tsx
"use client"

import { useMusicPlayer } from "@/contexts/music-player-context"
// ...other imports...

type Song = {
  id: string
  title: string
  artist: string
  albumCover?: string
}

type PlayButtonProps = {
  song: Song
  /** Optional: force a specific audio URL (e.g., full track) instead of the registry/preview lookup */
  src?: string
}

export function PlayButton({ song, src }: PlayButtonProps) {
  const { playTrack, seek /* if seek isn't exposed, remove this line */, isPlaying, currentSong } = useMusicPlayer()

  const handleClick = () => {
    // If you have a registry lookup inside playTrack, this explicit `src` will override it.
    playTrack({
      id: song.id,
      title: song.title,
      artist: song.artist,
      cover: song.albumCover,
      // ⬇️ THIS is the important part: force the full track on /buy
      src, // if undefined, existing behavior remains the same
    })

    // If your context exposes `seek`, reset to start so it doesn't jump mid-song.
    // Safe no-op if `seek` is available; otherwise remove.
    try {
      if (typeof seek === "function") seek(0)
    } catch {}
  }

  const isThisSong = currentSong?.id === song.id
  const playing = isThisSong && isPlaying

  return (
    <button
      aria-label={playing ? "Pause" : "Play"}
      onClick={handleClick}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#B8A082] bg-[#4a3f35] text-white hover:opacity-90 transition"
    >
      {/* your icon(s) exactly as you have them */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  )
}
