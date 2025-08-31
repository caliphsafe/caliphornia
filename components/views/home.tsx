"use client"

import { Header } from "@/components/patterns/header"
import { HomeAlbumDisplay } from "@/components/patterns/home-album-display"
import { ActivityFeed } from "@/components/patterns/activity-feed"
import { MusicPlayer } from "@/components/patterns/music-player"
import { useMusicPlayer } from "@/contexts/music-player-context"

export function Home() {
  const { isPlayerVisible, currentSong } = useMusicPlayer()

  return (
    <div
      className={`min-h-screen ${isPlayerVisible && currentSong ? "pb-32" : ""}`}
      style={{ backgroundColor: "#F3F2EE" }}
    >
      <Header />
      <div className="max-w-[640px] mx-auto">
        <HomeAlbumDisplay />
        <ActivityFeed />
      </div>
      <MusicPlayer />
    </div>
  )
}
