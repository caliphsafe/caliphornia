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

  useEffect(() => {
    console.log("[v0] Player state changed:", {
      currentSong: currentSong?.title || null,
      isPlaying,
      isPlayerVisible,
      isFullScreenOpen,
    })
  }, [currentSong, isPlaying, isPlayerVisible, isFullScreenOpen])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentSong) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1
          if (newTime >= 210) {
            setIsPlaying(false)
            return 0
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentSong])

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
    setCurrentTime(time)
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
