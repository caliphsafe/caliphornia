"use client"

import { useState, useCallback } from "react"
import Script from "next/script"
import { Header } from "@/components/patterns/header"
import { AlbumCover } from "@/components/patterns/album-cover"
import { Button } from "@/components/primitives/button"
import { ArrowUpRightIcon } from "@heroicons/react/24/outline"
import { PlayButton } from "@/components/patterns/play-button"

export function DownloadView() {
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [ecwidLoadedOnce, setEcwidLoadedOnce] = useState(false)

  const fullSong = {
    id: "polygamy-caliph",
    title: "Polygamy (Prod. By Caliph)",
    artist: "Caliph",
    albumCover: "/polygamy-cover.png",
  }

  // Initialize Ecwid and render both products into their containers
  const initEcwid = useCallback(() => {
    try {
      const w = window as any
      w.ec = w.ec || {}
      w.ec.storefront = w.ec.storefront || {}

      // storefront config (from your embed)
      w.ec.storefront.enable_navigation = true
      w.ec.storefront.product_details_layout = "TWO_COLUMNS_SIDEBAR_ON_THE_RIGHT"
      w.ec.storefront.product_details_gallery_layout = "IMAGE_SINGLE_THUMBNAILS_HORIZONTAL"
      w.ec.storefront.product_details_two_columns_with_right_sidebar_show_product_description_on_sidebar = true
      w.ec.storefront.product_details_two_columns_with_left_sidebar_show_product_description_on_sidebar = false
      w.ec.storefront.product_details_show_product_name = true
      w.ec.storefront.product_details_show_breadcrumbs = true
      w.ec.storefront.product_details_show_product_sku = false
      w.ec.storefront.product_details_show_product_price = true
      w.ec.storefront.product_details_show_in_stock_label = true
      w.ec.storefront.product_details_show_number_of_items_in_stock = true
      w.ec.storefront.product_details_show_qty = false
      w.ec.storefront.product_details_show_wholesale_prices = true
      w.ec.storefront.product_details_show_product_options = true
      w.ec.storefront.product_details_show_product_description = true
      w.ec.storefront.product_details_show_share_buttons = true
      w.ec.storefront.product_details_position_product_name = 100
      w.ec.storefront.product_details_position_breadcrumbs = 200
      w.ec.storefront.product_details_position_product_sku = 300
      w.ec.storefront.product_details_position_product_price = 400
      w.ec.storefront.product_details_position_buy_button = 600
      w.ec.storefront.product_details_position_wholesale_prices = 700
      w.ec.storefront.product_details_position_product_description = 800
      w.ec.storefront.product_details_position_share_buttons = 900
      w.ec.storefront.product_details_position_subtitle = 500
      w.ec.storefront.product_details_show_subtitle = true

      // Render helpers (only once script exposes xProductBrowser)
      const render = () => {
        if (typeof w.xProductBrowser !== "function") return false

        // Product 1: Cream T-Shirt
        w.xProductBrowser(
          "categoriesPerRow=3",
          "views=grid(20,3) list(60) table(60)",
          "categoryView=grid",
          "searchView=list",
          "defaultProductId=780973754",
          "defaultSlug=caliphornia-cream-puff-print-box-t-shirt",
          "id=ecwid-product-780973754"
        )

        // Product 2: Brown Bag Hoodie
        w.xProductBrowser(
          "categoriesPerRow=3",
          "views=grid(20,3) list(60) table(60)",
          "categoryView=grid",
          "searchView=list",
          "defaultProductId=780978001",
          "defaultSlug=caliphornia-brown-bag-relaxed-fit-hoodie",
          "id=ecwid-product-780978001"
        )
        return true
      }

      if (!render()) {
        setTimeout(render, 200)
      }
    } catch (e) {
      console.warn("[Ecwid] init failed:", e)
    }
  }, [])

  const handleToggleShop = () => {
    const next = !isShopOpen
    setIsShopOpen(next)
    // Load Ecwid script on first open
    if (next && !ecwidLoadedOnce) {
      setEcwidLoadedOnce(true)
    }
    // If script is already present (navigated back), try init immediately
    if (next && (window as any)?.xProductBrowser) {
      initEcwid()
    }
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
        <h1 className="font-bold text-black text-[32px] md:text-[48px]">POLYGAMY</h1>
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

        <div className="space-y-4">
          {/* LIPH GENIUS Link */}
          <button className="flex items-center justify-between py-4 w-full cursor-pointer hover:bg-black/5 transition-colors duration-200 px-2">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🧩</span>
              <span className="text-lg font-medium text-black">Play LIPH GENIUS ®</span>
            </div>
            <ArrowUpRightIcon className="w-6 h-6 text-black" />
          </button>

          {/* Merch Link → toggles dropdown panel */}
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
              isShopOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-6">
              {/* Product 1 container */}
              <div id="ecwid-product-780973754" className="bg-white/50 border border-[#B8A082]/60 rounded-md" />

              {/* Product 2 container */}
              <div id="ecwid-product-780978001" className="bg-white/50 border border-[#B8A082]/60 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Load Ecwid script only on first open, then init both products */}
      {ecwidLoadedOnce && (
        <Script
          id="ecwid-script"
          src="https://app.ecwid.com/script.js?108953252&data_platform=code"
          strategy="afterInteractive"
          onLoad={() => initEcwid()}
        />
      )}
    </div>
  )
}
