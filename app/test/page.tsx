"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// ✅ Load your no-paywall download test view only on the client
const DownloadTestView = dynamic(
  () => import("@/components/views/download-test").then((m) => m.DownloadView),
  { ssr: false, loading: () => null }
);

// --- your existing email gate (unchanged) ---
function EmailGate() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "exists" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!validEmail(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    try {
      setStatus("loading");
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data?.ok) {
        if (data.status === "exists") {
          setStatus("exists");
          setMessage("Welcome back! You’re already on the list.");
        } else {
          setStatus("success");
          setMessage("You're in! Check your email soon for access details.");
        }
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  const disabled = status === "loading";

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        background: "linear-gradient(180deg, #0b0b0b, #121212)",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          padding: 24,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h1 style={{ fontSize: 28, margin: "0 0 8px" }}>Get early access</h1>
        <p style={{ margin: "0 0 20px", opacity: 0.85 }}>
          Enter your email to unlock the preview and support the release.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14, opacity: 0.85 }}>Email address</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.3)",
                color: "#fff",
                outline: "none",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={disabled}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              background: disabled ? "rgba(255,255,255,0.15)" : "#42a5f5",
              color: "#0b0b0b",
              fontWeight: 600,
              transition: "transform 120ms ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {status === "loading" ? "Submitting..." : "Continue"}
          </button>
        </form>

        {message ? (
          <div
            role="status"
            style={{
              marginTop: 14,
              fontSize: 14,
              color:
                status === "error"
                  ? "#ff6b6b"
                  : status === "success" || status === "exists"
                  ? "#9be7a1"
                  : "#ddd",
            }}
          >
            {message}
          </div>
        ) : null}

        <p style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
          By continuing, you agree to receive email updates about this release.
        </p>
      </div>
    </main>
  );
}

// --- Only this tiny inner piece uses search params ---
function TestInner() {
  const params = useSearchParams();
  const gate = params.get("gate"); // if you ever want ?gate=1 to show the gate
  // Show your no-paywall download test view by default:
  if (gate === "1") return <EmailGate />;
  return <DownloadTestView />;
}

// --- Page export with Suspense boundary (required by Next) ---
export default function TestPage() {
  return (
    <Suspense fallback={null}>
      <TestInner />
    </Suspense>
  );
}
