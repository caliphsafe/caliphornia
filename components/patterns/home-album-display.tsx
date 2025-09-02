"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/primitives/button"
import { PlayButton } from "@/components/patterns/play-button"

export function HomeAlbumDisplay() {
  const router = useRouter()

  const optionsSong = {
    id: "polygamy-caliph",
    title: "Polygamy",
    artist: "Caliph",
    albumCover: "/polygamy-cover.png",
  }

  const handleBuyClick = () => {
    router.push("/buy")
  }

  return (
    <div className="px-6 mb-8">
      {/* Album Cover with Background Logo */}
      <div className="relative pt-5 px-5 pb-8 md:pt-0 md:px-5 md:pb-14 mb-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src="/caliphornia-logo.svg"
            alt="CALIPHORNIA Background"
            className="w-[376px] md:w-[768px] h-auto opacity-15"
          />
        </div>

        <div className="relative z-10 flex justify-center">
          <div className="border-4 border-[#B8A082]">
            <div className="bg-black overflow-hidden relative w-[280px] h-[280px] md:w-[480px] md:h-[480px]">
              <Image
                src="/options-album-cover.png"
                alt="Options album cover"
                width={480}
                height={480}
                className="w-full h-full object-cover relative z-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Song Info with Play Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-black mb-1">OPTIONS</h1>
          <p className="text-xl" style={{ color: "#9f8b79" }}>
            CALIPH
          </p>
        </div>
        <PlayButton song={optionsSong} />
      </div>

      {/* Buy Button */}
      <Button variant="primary" size="large" className="w-full" onClick={handleBuyClick}>
        BUY 'OPTIONS'
      </Button>
    </div>
  )
}
