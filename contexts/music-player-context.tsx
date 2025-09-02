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

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const listenersReadyRef = useRef(false)

  // Supporter cookie
  const isSupporter =
    typeof document !== "undefined" && document.cookie.includes("supporter=1")

  // Preview window (env-configurable)
  const PREVIEW_START =
    Number(process.env.NEXT_PUBLIC_PREVIEW_START_SECONDS ?? "0") || 0
  const PREVIEW_LEN =
    Number(process.env.NEXT_PUBLIC_PREVIEW_DURATION_SECONDS ?? "30") || 30
  const PREVIEW_END = PREVIEW_START + PREVIEW_LEN

  const resolveSrc = (song?: Song | null) =>
    song?.audioUrl || process.env.NEXT_PUBLIC_TRACK_URL || ""

  // Ensure we have an <audio> and listeners attached (create on demand)
  function ensureAudio() {
    if (typeof window === "undefined") return null

    if (!audioRef.current) {
      const el = new Audio()
      el.preload = "metadata"
      el.crossOrigin = "anonymous"
      audioRef.current = el
    }

    if (audioRef.current && !listenersReadyRef.current) {
      const el = audioRef.current

      const onLoadedMetadata = () => {
        setDuration(Number.isFinite(el.duration) ? el.duration : 0)
        if (!isSupporter) {
          try {
            const start = Math.min(PREVIEW_START, Math.max(0, (el.duration || 0) - 0.5))
            el.currentTime = start
            setCurrentTime(start)
          } catch {}
        }
      }

      const onTimeUpdate = () => {
        setCurrentTime(el.currentTime)
        if (!isSupporter) {
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

      listenersReadyRef.current = true
    }

    return audioRef.current
  }

  // Debug (optional)
  useEffect(() => {
    console.log("[player] state:", {
      song: currentSong?.title || null,
      isPlaying,
      isPlayerVisible,
      t: Math.round(currentTime),
      d: Math.round(duration),
      supporter: isSupporter,
      preview: { start: PREVIEW_START, end: PREVIEW_END },
    })
  }, [currentSong, isPlaying, isPlayerVisible, currentTime, duration, isSupporter])

  const playSong = async (song: Song) => {
    const el = ensureAudio()
    // set UI state regardless, so buttons update immediately
    setCurrentSong(song)
    setIsPlayerVisible(true)

    const src = resolveSrc(song)
    // 👇 NEW debug log
    console.log("[player] using src:", src)
    if (!src || !el) {
      console.warn("No track URL set. Define NEXT_PUBLIC_TRACK_URL or song.audioUrl.")
      setIsPlaying(false)
      return
    }

    if (el.src !== src) {
      el.src = src
      try {
        // el.load() is sync in most browsers; safe to call
        el.load()
      } catch {}
    }

    // Start position
    if (isSupporter) {
      el.currentTime = 0
      setCurrentTime(0)
    } else {
      el.currentTime = PREVIEW_START
      setCurrentTime(PREVIEW_START)
    }

    try {
      await el.play() // requires user gesture; your click provides it
      setIsPlaying(true)
    } catch (e) {
      console.warn("Audio play() blocked:", e)
      setIsPlaying(false)
    }
  }

  const togglePlayPause = async () => {
    const el = ensureAudio()
    if (!el) return

    if (el.paused) {
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
    const el = ensureAudio()
    if (!el) return

    if (!isSupporter) {
      const clamped = Math.max(PREVIEW_START, Math.min(time, PREVIEW_END - 0.25))
      el.currentTime = clamped
      setCurrentTime(clamped)
      return
    }

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
      {/* hidden <audio> is created and managed programmatically */}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")
  return ctx
}
