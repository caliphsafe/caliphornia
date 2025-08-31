"use client";

import { useEffect } from "react";
import { Header } from "@/components/patterns/header";
import { ArtistMessage } from "@/components/patterns/artist-message";
import { AlbumCover } from "@/components/patterns/album-cover";
import { SongInfo } from "@/components/patterns/song-info";
import { EmailForm } from "@/components/patterns/email-form";

export function LeadCapture() {
  // Auto-skip the gate if cookie is already set
  useEffect(() => {
    if (typeof document !== "undefined" && document.cookie.includes("gate=1")) {
      window.location.replace("/home");
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3F2EE" }}>
      <Header />
      <ArtistMessage />
      <AlbumCover />
      <SongInfo />
      <EmailForm />
    </div>
  );
}
