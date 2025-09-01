"use client";

import { useEffect, useState } from "react";
import { Home } from "@/components/views/home";

// Optional: if you created the preview component earlier. If not, this inline <audio> works fine.
// import { PreviewAudio } from "@/components/patterns/preview-audio";

export default function HomePage() {
  const [isSupporter, setIsSupporter] = useState<boolean | null>(null);

  useEffect(() => {
    const has = typeof document !== "undefined" && document.cookie.includes("supporter=1");
    setIsSupporter(has);
  }, []);

  // While checking cookie, avoid flicker
  if (isSupporter === null) {
    return <div style={{ minHeight: "100dvh", background: "#F3F2EE" }} />;
  }

  // ✅ Supporters see your original page exactly as-is:
  if (isSupporter) {
    return <Home />;
  }

  // 🔒 Non-supporters: show a neutral preview block on your site background
  const previewSrc = process.env.NEXT_PUBLIC_PREVIEW_URL;

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#F3F2EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>30-second Preview</h1>
        <p style={{ margin: "0 0 16px", color: "#444" }}>
          Contribute to unlock the full song, lyric game, and exclusive merch.
        </p>

        {previewSrc ? (
          <audio
            controls
            preload="metadata"
            style={{ width: "100%", marginBottom: 16 }}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.currentTime >= 30) {
                el.pause();
                el.currentTime = 0;
              }
            }}
          >
            <source src={previewSrc} />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: "#f7f7f7",
              border: "1px solid #eee",
              color: "#555",
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            Set <code>NEXT_PUBLIC_PREVIEW_URL</code> in Vercel → Environment Variables to enable the preview player.
          </div>
        )}

        <a
          href="/support"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 16px",
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Contribute to Unlock
        </a>
      </div>
    </main>
  );
}
