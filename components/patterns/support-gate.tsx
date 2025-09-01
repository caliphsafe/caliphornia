// components/patterns/support-gate.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { PreviewAudio } from "@/components/patterns/preview-audio";

interface SupportGateProps {
  children: ReactNode;       // Full content (full song / lyric game / merch)
  ctaHref?: string;          // Where the “Contribute to unlock” button points
  title?: string;            // Title above the preview
  note?: string;             // Small note under the preview
}

export function SupportGate({
  children,
  ctaHref = "/support",      // we’ll wire this during the contribution step
  title = "30-second Preview",
  note = "Contribute to unlock the full song, lyric game, and exclusive merch."
}: SupportGateProps) {
  const [isSupporter, setIsSupporter] = useState<boolean | null>(null);

  useEffect(() => {
    // supporter cookie will be set after successful contribution later
    const has = typeof document !== "undefined" && document.cookie.includes("supporter=1");
    setIsSupporter(has);
  }, []);

  if (isSupporter === null) {
    // avoid layout flash; lightweight skeleton
    return <div className="w-full max-w-xl mx-auto p-4 text-sm text-gray-500">Loading...</div>;
  }

  if (isSupporter) {
    // ✅ Unlocked: render the full content
    return <>{children}</>;
  }

  // 🔒 Locked: show preview + CTA
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 px-4">
      <PreviewAudio title={title} />
      <p className="text-sm text-gray-600 text-center">{note}</p>
      <a
        href={ctaHref}
        className="inline-flex items-center justify-center rounded-lg px-5 py-3 font-semibold text-white"
        style={{ background: "#111" }}
      >
        Contribute to Unlock
      </a>
    </div>
  );
}
