"use client"

import { createContext, useContext, useState, useRef, type ReactNode } from "react"

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

  // Wait for metadata helper (for Safari/Chrome reliability)
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

  // Track source: per-song override, then env var
  const resolveSrc = (song?: Song | null) =>
    song?.audioUrl || process.env.NEXT_PUBLIC_TRACK_URL

  // Default song so toggle works even if no track has been selected yet
  const DEFAULT_SONG: Song = {
    id: "default",
    title: "Track",
    artist: "Caliph",
    albumCover: "/placeholder.svg",
  }

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
      console.log("[audio] created & appended")
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
          readyState: el.readyState,    // 0..4
          networkState: el.networkState // 0..3
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

  const playSong = async (song: Song) => {
    const el = ensureAudio()
    setCurrentSong(song)
    setIsPlayerVisible(true)

    const src = resolveSrc(song)
    console.log("[player] using src:", src)

    if (!el || !src) {
      console.warn("No track URL set. Define NEXT_PUBLIC_TRACK_URL or song.audioUrl.")
      setIsPlaying(false)
      return
    }

    // Pause before swapping source
    try { el.pause() } catch {}
    setIsPlaying(false)

    // Rebuild <source> each time
    while (el.firstChild) el.removeChild(el.firstChild)
    const source = document.createElement("source")
    source.src = src
    source.type = "audio/mpeg"
    el.appendChild(source)

    try {
      el.load()
      console.log("[audio] after load()", {
        currentSrc: el.currentSrc,
        readyState: el.readyState,
        networkState: el.networkState
      })
    } catch {}

    // Wait for metadata so seeking / duration are reliable
    await waitForMetadata(el)

    // Always start from the beginning (no preview behavior)
    el.currentTime = 0
    setCurrentTime(0)

    try {
      await el.play()
      setIsPlaying(true)
      console.log("[audio] play() OK")
    } catch (e: any) {
      console.warn("[audio] play() failed:", e?.name || e, {
        readyState: el.readyState,
        networkState: el.networkState,
        currentTime: el.currentTime,
        currentSrc: el.currentSrc,
      })
      setIsPlaying(false)
    }
  }

  const togglePlayPause = async () => {
    const el = ensureAudio()
    if (!el) return

    // If nothing loaded yet, start the default track on first toggle
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
      {/* audio element is appended to <body> for Safari compatibility */}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")
  return ctx
}
