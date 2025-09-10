"use client"

import { useState, useCallback, useEffect } from "react"
import Script from "next/script"
import { Header } from "@/components/patterns/header"
import { AlbumCover } from "@/components/patterns/album-cover"
import { Button } from "@/components/primitives/button"
import { ArrowUpRightIcon } from "@heroicons/react/24/outline"
import { PlayButton } from "@/components/patterns/play-button"

export function DownloadView() {
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isGameOpen, setIsGameOpen] = useState(false)
  const [ecwidLoadedOnce, setEcwidLoadedOnce] = useState(false)

  const fullSong = {
    id: "polygamy-caliph",
    title: "Polygamy (Prod. By Caliph)",
    artist: "Caliph",
    albumCover: "/polygamy-cover.png",
  }

  // Render SingleProduct widgets when script is available
  const renderSingleProducts = useCallback(() => {
    try {
      const w = window as any
      if (typeof w.xProduct === "function") {
        w.xProduct()
      }
    } catch (e) {
      console.warn("[Ecwid] xProduct render failed:", e)
    }
  }, [])

  // If the shop panel opens and the script is already present (e.g., back/forward nav), render immediately
  useEffect(() => {
    if (isShopOpen && (window as any)?.xProduct) {
      renderSingleProducts()
    }
  }, [isShopOpen, renderSingleProducts])

  const handleToggleShop = () => {
    const next = !isShopOpen
    setIsShopOpen(next)
    if (next && !ecwidLoadedOnce) {
      setEcwidLoadedOnce(true) // triggers Script load
    }
  }

  const handleToggleGame = () => {
    setIsGameOpen((v) => !v)
  }

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: "#f3f2ee" }}>
      {/* Header */}
      <div className="text-center mb-8">
        <Header />
      </div>

      {/* Album Cover */}
      <div className="mb-8">
        <AlbumCover />
      </div>

      {/* Song Info with Play Button (mirrors Home layout) */}
      <div className="flex items-center justify-between mb-8 max-w-[640px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">{fullSong.title.toUpperCase()}</h1>
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

        <div className="space-y-4">
          {/* LYRIC GENIUS Link → toggles dropdown with embedded game */}
          <button
            onClick={handleToggleGame}
            className="flex items-center justify-between py-4 w-full cursor-pointer hover:bg-black/5 transition-colors duration-200 px-2"
            aria-expanded={isGameOpen}
            aria-controls="lyric-genius-panel"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🧩</span>
              <span className="text-lg font-medium text-black">Play LYRIC GENIUS</span>
            </div>
            <ArrowUpRightIcon className={`w-6 h-6 text-black transition-transform ${isGameOpen ? "rotate-45" : ""}`} />
          </button>

          {/* Dropdown panel for LYRIC GENIUS (iframe) */}
          <div
            id="lyric-genius-panel"
            className={`overflow-hidden transition-all duration-500 ease-out ${
              isGameOpen ? "max-h-[3000px] opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <div className="rounded-md border border-[#B8A082]/60 bg-white/60">
              <iframe
                title="Lyric Genius"
                src="https://lyric-genius-main.vercel.app/"
                className="w-full h-[70vh] md:h-[75vh] rounded-md"
                loading="lazy"
                allow="clipboard-write; autoplay; fullscreen; accelerometer; gyroscope"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>

          {/* Merch Link → toggles dropdown with 2-column products */}
          <button
            onClick={handleToggleShop}
            className="flex items-center justify-between py-4 w-full cursor-pointer hover:bg-black/5 transition-colors duration-200 px-2"
            aria-expanded={isShopOpen}
            aria-controls="shop-panel"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🛍️</span>
              <span className="text-lg font-medium text-black">Shop CALIPHORNIA® Merch</span>
            </div>
            <ArrowUpRightIcon className={`w-6 h-6 text-black transition-transform ${isShopOpen ? "rotate-45" : ""}`} />
          </button>

          {/* Dropdown panel (same width as content) */}
          <div
            id="shop-panel"
            className={`overflow-hidden transition-all duration-500 ease-out ${
              isShopOpen ? "max-h-[3000px] opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            {/* 2-column layout on md+, stacked on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product 1 — SingleProduct v2 */}
              <div className="bg-white/50 border border-[#B8A082]/60 rounded-md p-3">
                <div
                  className="ecsp ecsp-SingleProduct-v2 ecsp-SingleProduct-v2-bordered ecsp-SingleProduct-v2-centered ecsp-Product ec-Product-780973754"
                  itemScope
                  itemType="http://schema.org/Product"
                  data-single-product-id="780973754"
                >
                  <div itemProp="image" />
                  <div className="ecsp-title" itemProp="name" content="Caliphornia Cream Puff Print Box T-Shirt" />
                  <div itemType="http://schema.org/Offer" itemScope itemProp="offers">
                    <div
                      className="ecsp-productBrowser-price ecsp-price"
                      itemProp="price"
                      content="35"
                      data-spw-price-location="button"
                    >
                      <div itemProp="priceCurrency" content="USD" />
                    </div>
                  </div>
                  <div customprop="options" />
                  <div customprop="qty" />
                  <div customprop="addtobag" />
                  <div customprop="vatinprice" />
                </div>
              </div>

              {/* Product 2 — SingleProduct v2 */}
              <div className="bg-white/50 border border-[#B8A082]/60 rounded-md p-3">
                <div
                  className="ecsp ecsp-SingleProduct-v2 ecsp-SingleProduct-v2-bordered ecsp-SingleProduct-v2-centered ecsp-Product ec-Product-780978001"
                  itemScope
                  itemType="http://schema.org/Product"
                  data-single-product-id="780978001"
                >
                  <div itemProp="image" />
                  <div className="ecsp-title" itemProp="name" content="Caliphornia Brown Bag Relaxed Fit Hoodie" />
                  <div itemType="http://schema.org/Offer" itemScope itemProp="offers">
                    <div
                      className="ecsp-productBrowser-price ecsp-price"
                      itemProp="price"
                      content="70"
                      data-spw-price-location="button"
                    >
                      <div itemProp="priceCurrency" content="USD" />
                    </div>
                  </div>
                  <div customprop="options" />
                  <div customprop="qty" />
                  <div customprop="addtobag" />
                  <div customprop="vatinprice" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Load Ecwid SingleProduct script once on first open and render widgets */}
      {ecwidLoadedOnce && (
        <Script
          id="ecwid-singleproduct"
          src="https://app.ecwid.com/script.js?108953252&data_platform=singleproduct_v2"
          strategy="afterInteractive"
          onLoad={() => renderSingleProducts()}
        />
      )}
    </div>
  )
}
