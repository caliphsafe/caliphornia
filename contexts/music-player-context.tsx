"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Song {
  id: string
  title: string
  artist: string
  albumCover: string
  audioUrl?: string
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

  // NEW: helper — supporters can play full track
  const supporter =
    typeof document !== "undefined" && document.cookie.includes("supporter=1")

  useEffect(() => {
    console.log("[v0] Player state changed:", {
      currentSong: currentSong?.title || null,
      isPlaying,
      isPlayerVisible,
      isFullScreenOpen,
    })
  }, [currentSong, isPlaying, isPlayerVisible, isFullScreenOpen])

  // UPDATED: tick logic with preview cap for non-supporters
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isPlaying && currentSong) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const limit = supporter ? duration || 210 : 30 // 30s cap for non-supporters
          const newTime = prev + 1
          if (newTime >= limit) {
            setIsPlaying(false)
            return 0
          }
          return newTime
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentSong, supporter, duration])

  useEffect(() => {
    if (typeof document === "undefined") return

    if (isFullScreenOpen) {
      // Prevent background scrolling
      document.body.style.overflow = "hidden"
    } else {
      // Restore scrolling
      document.body.style.overflow = "unset"
    }

    // Cleanup on unmount
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset"
      }
    }
  }, [isFullScreenOpen])

  const playSong = (song: Song) => {
    console.log("[v0] Playing song:", song.title)
    setCurrentSong(song)
    setIsPlaying(true)
    setIsPlayerVisible(true)
    // Keep your existing default duration (e.g., 210s)
    setDuration(210)
    setCurrentTime(0)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const hidePlayer = () => {
    console.log("[v0] Hiding player")
    setIsPlayerVisible(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setIsFullScreenOpen(false)
  }

  const seekTo = (time: number) => {
    // Prevent seeking beyond preview for non-supporters
    const maxTime = supporter ? (duration || 210) : 30
    const clamped = Math.max(0, Math.min(time, maxTime - 1))
    setCurrentTime(clamped)
  }

  const openFullScreen = () => {
    setIsFullScreenOpen(true)
  }

  const closeFullScreen = () => {
    setIsFullScreenOpen(false)
  }

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
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")
  }
  return context
}
