import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { MusicPlayerProvider } from "@/contexts/music-player-context"
import { MusicPlayer } from "@/components/patterns/music-player"
import { FullScreenPlayer } from "@/components/patterns/full-screen-player"
import { ScrollToTop } from "@/components/utils/scroll-to-top"
import { Footer } from "@/components/patterns/footer"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Caliphornia Player",
  description: "Music player for Caliphornia",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <MusicPlayerProvider>
          <ScrollToTop />
          {children}
          <Footer /> {/* Footer always visible at bottom of every page */}
          <MusicPlayer />
          <FullScreenPlayer />
        </MusicPlayerProvider>
      </body>
    </html>
  )
}
