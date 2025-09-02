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

  // Supporter cookie
  const isSupporter =
    typeof document !== "undefined" && document.cookie.includes("supporter=1")

  // 🔹 Preview window controls (env-configurable)
  const PREVIEW_START =
    Number(process.env.NEXT_PUBLIC_PREVIEW_START_SECONDS ?? "0") || 0
  const PREVIEW_LEN =
    Number(process.env.NEXT_PUBLIC_PREVIEW_DURATION_SECONDS ?? "30") || 30
  const PREVIEW_END = PREVIEW_START + PREVIEW_LEN

  const resolveSrc = (song?: Song | null) =>
    song?.audioUrl || process.env.NEXT_PUBLIC_TRACK_URL || ""

  // Create the audio element once
  useEffect(() => {
    if (typeof window === "undefined") return
    if (audioRef.current) return

    const el = new Audio()
    el.preload = "metadata"
    el.crossOrigin = "anonymous"
    audioRef.current = el

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(el.duration) ? el.duration : 0)
      // If non-supporter, jump to preview start as soon as metadata is ready
      if (!isSupporter) {
        try {
          // Clamp to valid range
          const start = Math.min(PREVIEW_START, Math.max(0, el.duration - 0.5))
          el.currentTime = start
          setCurrentTime(start)
        } catch {}
      }
    }

    const onTimeUpdate = () => {
      // Keep state in sync
      setCurrentTime(el.currentTime)

      if (!isSupporter) {
        // Enforce window: [PREVIEW_START, PREVIEW_END)
        if (el.currentTime < PREVIEW_START) {
          el.currentTime = PREVIEW_START
          return
        }
        if (el.currentTime >= PREVIEW_END) {
          el.pause()
          el.currentTime = PREVIEW_START
          setIsPlaying(false)
          setCurrentTime(PREVIEW_START)
          return
        }
      }
    }

    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    el.addEventListener("loadedmetadata", onLoadedMetadata)
    el.addEventListener("timeupdate", onTimeUpdate)
    el.addEventListener("ended", onEnded)

    return () => {
      el.pause()
      el.removeEventListener("loadedmetadata", onLoadedMetadata)
      el.removeEventListener("timeupdate", onTimeUpdate)
      el.removeEventListener("ended", onEnded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* mount once */])

  useEffect(() => {
    console.log("[v0] Player state:", {
      currentSong: currentSong?.title || null,
      isPlaying,
      isPlayerVisible,
      currentTime: Math.round(currentTime),
      duration: Math.round(duration),
      supporter: isSupporter,
      preview: { start: PREVIEW_START, end: PREVIEW_END },
    })
  }, [currentSong, isPlaying, isPlayerVisible, currentTime, duration, isSupporter])

  const playSong = async (song: Song) => {
    const el = audioRef.current
    if (!el) return

    setCurrentSong(song)
    setIsPlayerVisible(true)

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

    // Set start position
    if (isSupporter) {
      el.currentTime = 0
      setCurrentTime(0)
    } else {
      // Jump to preview window start
      const start = PREVIEW_START
      try {
        // If metadata not loaded yet, this will “stick” after loadedmetadata
        el.currentTime = start
      } catch {}
      setCurrentTime(start)
    }

    try {
      await el.play()
      setIsPlaying(true)
    } catch (e) {
      console.warn("Audio play() blocked:", e)
      setIsPlaying(false)
    }
  }

  const togglePlayPause = async () => {
    const el = audioRef.current
    if (!el) return

    if (el.paused) {
      // If non-supporter and cursor is outside preview window, reset to start
      if (!isSupporter && (el.currentTime < PREVIEW_START || el.currentTime >= PREVIEW_END)) {
        el.currentTime = PREVIEW_START
        setCurrentTime(PREVIEW_START)
      }
      try {
        await el.play()
        setIsPlaying(true)
      } catch (e) {
        console.warn("Audio play() blocked:", e)
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

    if (!isSupporter) {
      // Clamp seeks inside preview window, leave a tiny headroom before end
      const clamped = Math.max(PREVIEW_START, Math.min(time, PREVIEW_END - 0.25))
      el.currentTime = clamped
      setCurrentTime(clamped)
      return
    }

    // Supporters can seek anywhere
    const max = Number.isFinite(el.duration) ? el.duration : time
    const clamped = Math.max(0, Math.min(time, max))
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
      {/* Hidden audio lives in memory via audioRef */}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")
  return ctx
}
