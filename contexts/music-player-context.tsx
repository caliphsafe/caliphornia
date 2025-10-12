"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"

interface Song {
  id: string
  title: string
  artist: string
  albumCover: string
  audioUrl?: string // per-song override (optional)
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

  // ---- One-per-session play logger (restored) ----
  const hasLoggedPlayRef = useRef(false)
  function logFirstPlayOnce(song?: Song | null) {
    if (hasLoggedPlayRef.current) return
    hasLoggedPlayRef.current = true

    try {
      const payload = {
        t: Date.now(),
        page: typeof window !== "undefined" ? window.location.pathname : "",
        songId: song?.id ?? null,
        songTitle: song?.title ?? null,
      }
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
      // Prefer sendBeacon for reliability during page transitions
      if (navigator.sendBeacon && navigator.sendBeacon("/api/activity/play", blob)) {
        return
      }
    } catch {
      // no-op
    }

    // Fallback
    try {
      fetch("/api/activity/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: Date.now(), songId: song?.id ?? null }),
        keepalive: true,
      }).catch(() => {})
    } catch {
      // no-op
    }
  }

  // Simple metadata wait to make currentTime/duration reliable (esp. Safari)
  function waitForMetadata(el: HTMLAudioElement, timeoutMs = 1500) {
    if (el.readyState >= 1) return Promise.resolve()
    return new Promise<void>((resolve) => {
      let done = false
      const onLoaded = () => {
        if (done) return
        done = true
        el.removeEventListener("loadedmetadata", onLoaded)
        resolve()
      }
      el.addEventListener("loadedmetadata", onLoaded)
      setTimeout(() => {
        if (done) return
        done = true
        el.removeEventListener("loadedmetadata", onLoaded)
        resolve()
      }, timeoutMs)
    })
  }

  const resolveSrc = (song?: Song | null) => song?.audioUrl || process.env.NEXT_PUBLIC_TRACK_URL

  function ensureAudio() {
    if (typeof window === "undefined") return null

    if (!audioRef.current) {
      const el = document.createElement("audio")
      el.preload = "metadata"
      el.playsInline = true
      el.controls = false
      el.style.display = "none"
      document.body.appendChild(el)
      audioRef.current = el
    }

    if (audioRef.current && !listenersReadyRef.current) {
      const el = audioRef.current

      const onLoadedMetadata = () => {
        setDuration(Number.isFinite(el.duration) ? el.duration : 0)
      }

      const onTimeUpdate = () => {
        setCurrentTime(el.currentTime)
      }

      const onEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      const onError = () => {
        const err = el.error
        console.error("[audio] error", {
          code: err?.code,
          message:
            err?.code === 1 ? "MEDIA_ERR_ABORTED" :
            err?.code === 2 ? "MEDIA_ERR_NETWORK" :
            err?.code === 3 ? "MEDIA_ERR_DECODE" :
            err?.code === 4 ? "MEDIA_ERR_SRC_NOT_SUPPORTED" :
            "UNKNOWN",
          currentSrc: el.currentSrc,
          readyState: el.readyState,
          networkState: el.networkState
        })
      }

      el.addEventListener("loadedmetadata", onLoadedMetadata)
      el.addEventListener("timeupdate", onTimeUpdate)
      el.addEventListener("ended", onEnded)
      el.addEventListener("error", onError)

      listenersReadyRef.current = true
    }

    return audioRef.current
  }

  const DEFAULT_SONG: Song = {
    id: "default",
    title: "Track",
    artist: "Caliph",
    albumCover: "/placeholder.svg",
  }

  const playSong = async (song: Song) => {
    const el = ensureAudio()
    setCurrentSong(song)
    setIsPlayerVisible(true)

    const src = resolveSrc(song)
    if (!el || !src) {
      console.warn("No track URL set. Define NEXT_PUBLIC_TRACK_URL or provide song.audioUrl.")
      setIsPlaying(false)
      return
    }

    // Pause before swapping source
    try { el.pause() } catch {}

    // Replace source cleanly
    while (el.firstChild) el.removeChild(el.firstChild)
    const source = document.createElement("source")
    source.src = src
    source.type = "audio/mpeg"
    el.appendChild(source)

    try { el.load() } catch {}

    await waitForMetadata(el)

    // Start from the beginning for full-song behavior
    el.currentTime = 0
    setCurrentTime(0)

    // Try to play
    const tryPlay = async (label: string) => {
      try {
        await el.play()
        setIsPlaying(true)
        // 🔸 restored: log first play once per page session (works on /buy)
        logFirstPlayOnce(song)
        return true
      } catch (e: any) {
        console.warn(`[audio] play() failed (${label}):`, e?.name || e, {
          readyState: el.readyState,
          networkState: el.networkState,
          currentTime: el.currentTime,
          currentSrc: el.currentSrc,
        })
        setIsPlaying(false)
        return false
      }
    }

    if (await tryPlay("initial")) return

    // Retry once after canplay or short timeout
    await new Promise<void>((resolve) => {
      let done = false
      const onCanPlay = async () => {
        if (done) return
        done = true
        el.removeEventListener("canplay", onCanPlay)
        el.removeEventListener("canplaythrough", onCanPlay)
        await tryPlay("canplay")
        resolve()
      }
      el.addEventListener("canplay", onCanPlay, { once: true })
      el.addEventListener("canplaythrough", onCanPlay, { once: true })
      setTimeout(async () => {
        if (done) return
        done = true
        el.removeEventListener("canplay", onCanPlay)
        el.removeEventListener("canplaythrough", onCanPlay)
        await tryPlay("timeout-300ms")
        resolve()
      }, 300)
    })
  }

  const togglePlayPause = async () => {
    const el = ensureAudio()
    if (!el) return

    if (!currentSong) {
      await playSong(DEFAULT_SONG)
      return
    }

    if (el.paused) {
      try {
        await el.play()
        setIsPlaying(true)
      } catch (e: any) {
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
      {/* audio element is appended to <body> */}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")
  return ctx
}
