// components/patterns/preview-audio.tsx
"use client";

import { useRef, useEffect } from "react";

interface PreviewAudioProps {
  title?: string;
}

export function PreviewAudio({ title = "Song Preview" }: PreviewAudioProps) {
  const src = process.env.NEXT_PUBLIC_PREVIEW_URL;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    // Optional: ensure playback is limited to ~30s if your preview file is longer.
    // If your file is already a 30s clip, you can delete this effect.
    const el = audioRef.current;
    const onTimeUpdate = () => {
      if (el.currentTime >= 30) {
        el.pause();
        el.currentTime = 0;
      }
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    return () => el.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  if (!src) {
    return (
      <div className="w-full max-w-xl mx-auto p-4 rounded-lg border" style={{ background: "#fff" }}>
        <p className="text-sm text-gray-700">
          Missing <code>NEXT_PUBLIC_PREVIEW_URL</code>. Set it in Vercel → Project Settings → Environment Variables.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-4 rounded-lg border" style={{ background: "#fff" }}>
      <div className="mb-2 font-semibold">{title}</div>
      <audio ref={audioRef} controls preload="metadata" style={{ width: "100%" }}>
        <source src={src} />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
