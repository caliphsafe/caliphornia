"use client"

import { Header } from "@/components/patterns/header"
import { AlbumCover } from "@/components/patterns/album-cover"
import { Button } from "@/components/primitives/button"
import { ArrowUpRightIcon } from "@heroicons/react/24/outline"
import { PlayButton } from "@/components/patterns/play-button"

export function DownloadView() {
  const fullSong = {
    id: "options-caliph",
    title: "Options",
    artist: "Caliph",
    albumCover: "/options-album-cover.png",
  }

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: "#f3f2ee" }}>
      {/* Header */}
      <div className="text-center mb-8">
        <Header />
      </div>

      {/* Download Text */}
      <div className="text-center mb-2">
        <p className="text-lg font-medium" style={{ color: "#9f8b79" }}>
          DOWNLOAD
        </p>
      </div>

      {/* Options Title */}
      <div className="text-center mb-8">
        <h1 className="font-bold text-black text-[32px] md:text-[48px]">OPTIONS</h1>
      </div>

      {/* Album Cover */}
      <div className="mb-8">
        <AlbumCover />
      </div>

      {/* Song Info with Play Button (mirrors Home page layout) */}
      <div className="flex items-center justify-between mb-8 max-w-[640px] mx-auto">
        <div>
          <h1 className="text-4xl font-bold text-black mb-1">{fullSong.title.toUpperCase()}</h1>
          <p className="text-xl" style={{ color: "#9f8b79" }}>
            {fullSong.artist.toUpperCase()}
          </p>
        </div>
        <PlayButton song={fullSong} />
      </div>

      {/* Download Button */}
      <div className="mb-12 max-w-[640px] mx-auto">
        <Button
          variant="primary"
          size="large"
          className="w-full text-xl font-bold py-6"
          style={{ backgroundColor: "#4a3f35", color: "white" }}
        >
          DOWNLOAD .MP3
        </Button>
      </div>

      {/* Bonuses Section */}
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-2xl font-bold text-black mb-6">Bonuses</h2>

        <div className="space-y-6">
          {/* LIPH GENIUS Link */}
          <button className="flex items-center justify-between py-4 w-full cursor-pointer hover:bg-black/5 transition-colors duration-200 px-2">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🧩</span>
              <span className="text-lg font-medium text-black">Play LIPH GENIUS ®</span>
            </div>
            <ArrowUpRightIcon className="w-6 h-6 text-black" />
          </button>

          {/* Merch Link */}
          <button className="flex items-center justify-between py-4 w-full cursor-pointer hover:bg-black/5 transition-colors duration-200 px-2">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🛍️</span>
              <span className="text-lg font-medium text-black">Shop CALIPHORNIA® Merch</span>
            </div>
            <ArrowUpRightIcon className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}
