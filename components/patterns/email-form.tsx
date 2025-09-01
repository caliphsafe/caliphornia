"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { Button } from "@/components/primitives/button"
import { Input } from "@/components/primitives/input"

interface EmailFormProps {
  className?: string
}

export function EmailForm({ className }: EmailFormProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (email.includes("..") || email.includes(".,") || email.includes(",.")) {
      return false
    }
    return emailRegex.test(email)
  }

  const isEmailValid = isValidEmail(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    if (!isEmailValid) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }

    try {
      setStatus("loading")
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok && data?.ok) {
  // ✅ set cookies for 1 year
  document.cookie = "gate=1; Path=/; Max-Age=31536000"
  document.cookie = `gate_email=${encodeURIComponent(email.toLowerCase().trim())}; Path=/; Max-Age=31536000`
  router.push("/home")
  return
}
 else {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    } finally {
      setStatus("idle")
    }
  }

  return (
    <div className={`max-w-[640px] mx-auto ${className} pt-0 px-5 pb-8 md:px-8`}>
      <form onSubmit={handleSubmit}>
        <div className="flex w-full mb-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="large"
          />
        </div>
        <div>
          <Button
            type="submit"
            disabled={!isEmailValid || status === "loading"}
            variant="primary"
            size="large"
            className="w-full"
          >
            <Lock className="w-5 h-5" />
            {status === "loading" ? "Submitting..." : "UNLOCK SONG"}
          </Button>
        </div>
        {message && (
          <p className="mt-3 text-sm" style={{ color: status === "error" ? "#ff6b6b" : "#333" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
