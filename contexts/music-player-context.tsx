"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"

interface Song {
  id: string
  title: string
  artist: string
  albumCover: string
  audioUrl?: string // optional override per song
}

interface MusicPlayerContextType {
  currentSong: Song | null
  isPlaying: boolean
  isPlayerVisible: boolean
  isFullScreenOpen: boolean
  currentTime: number
  duration: number
  playSong: (song: Song) => void
  togglePlayPause: () => void
  hidePlayer: () => void
  seekTo: (time: number) => void
  openFullScreen: () => void
  closeFullScreen: () => void
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayerVisible, setIsPlayerVisible] = useState(false)
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Real <audio> element lives here
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Helper: determine preview vs full
  const isSupporter =
    typeof document !== "undefined" && document.cookie.includes("supporter=1")

  // Create the audio element once on the client
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!audioRef.current) {
      const el = new Audio()
      el.preload = "metadata"
      el.crossOrigin = "anonymous" // safe default for CDN assets
      audioRef.current = el

      // events → state sync
      const onLoadedMetadata = () => {
        // Use actual duration for supporters; for non-supporters we still show full length
        setDuration(Number.isFinite(el.duration) ? el.duration : 0)
      }
      const onTimeUpdate = () => {
        setCurrentTime(el.currentTime)
        // 30s preview limiter for non-supporters
        if (!isSupporter && el.currentTime >= 30) {
          el.pause()
          el.currentTime = 0
          setIsPlaying(false)
        }
      }
      const onEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      el.addEventListener("loadedmetadata", onLoadedMetadata)
      el.addEventListener("timeupdate", onTimeUpdate)
      el.addEventListener("ended", onEnded)

      // Cleanup on unmount (rare, since provider is global)
      return () => {
        el.pause()
        el.removeEventListener("loadedmetadata", onLoadedMetadata)
        el.removeEventListener("timeupdate", onTimeUpdate)
        el.removeEventListener("ended", onEnded)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* mount once */])

  // Debug (optional)
  useEffect(() => {
    console.log("[v0] Player state changed:", {
      currentSong: currentSong?.title || null,
      isPlaying,
      isPlayerVisible,
      isFullScreenOpen,
      currentTime: Math.round(currentTime),
      duration: Math.round(duration),
      supporter: isSupporter,
    })
  }, [currentSong, isPlaying, isPlayerVisible, isFullScreenOpen, currentTime, duration, isSupporter])

  const resolveSrc = (song?: Song | null) => {
    return song?.audioUrl || process.env.NEXT_PUBLIC_TRACK_URL || ""
  }

  const playSong = async (song: Song) => {
    const el = audioRef.current
    if (!el) return

    setCurrentSong(song)
    setIsPlayerVisible(true)

    // Load source (full track URL; preview enforced by limiter)
    const src = resolveSrc(song)
    if (!src) {
      console.warn("No track URL set. Define NEXT_PUBLIC_TRACK_URL or song.audioUrl.")
      setIsPlaying(false)
      return
    }

    if (el.src !== src) {
      el.src = src
      try {
        await el.load?.()
      } catch {}
    }

    // Start from 0 on new song
    el.currentTime = 0

    try {
      await el.play()
      setIsPlaying(true)
    } catch (e) {
      // Autoplay can be blocked until user gesture; keep visible but paused
      console.warn("Audio play() was blocked:", e)
      setIsPlaying(false)
    }
  }

  const togglePlayPause = async () => {
    const el = audioRef.current
    if (!el) return

    if (el.paused) {
      // If non-supporter and we somehow are past 30, reset
      if (!isSupporter && el.currentTime >= 30) {
        el.currentTime = 0
      }
      try {
        await el.play()
        setIsPlaying(true)
      } catch (e) {
        console.warn("Audio play() was blocked:", e)
        setIsPlaying(false)
      }
    } else {
      el.pause()
      setIsPlaying(false)
    }
  }

  const hidePlayer = () => {
    const el = audioRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
    }
    setIsPlayerVisible(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setIsFullScreenOpen(false)
  }

  const seekTo = (time: number) => {
    const el = audioRef.current
    if (!el) return
    // Clamp seeks to preview for non-supporters
    const maxTime = !isSupporter ? 30 : (Number.isFinite(el.duration) ? el.duration : time)
    const clamped = Math.max(0, Math.min(time, maxTime - 0.25))
    el.currentTime = clamped
    setCurrentTime(clamped)
  }

  const openFullScreen = () => setIsFullScreenOpen(true)
  const closeFullScreen = () => setIsFullScreenOpen(false)

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        isPlayerVisible,
        isFullScreenOpen,
        currentTime,
        duration,
        playSong,
        togglePlayPause,
        hidePlayer,
        seekTo,
        openFullScreen,
        closeFullScreen,
      }}
    >
      {children}
      {/* No visible <audio>; it lives in memory via audioRef */}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")
  return ctx
}
