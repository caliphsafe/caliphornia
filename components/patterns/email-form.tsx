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
  const router = useRouter()

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Additional checks for consecutive dots and other invalid patterns
    if (email.includes("..") || email.includes(".,") || email.includes(",.")) {
      return false
    }

    return emailRegex.test(email)
  }

  const isEmailValid = isValidEmail(email)

  const handleUnlockSong = () => {
    if (isEmailValid) {
      router.push("/home")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUnlockSong()
  }

  return (
    <div className={`max-w-[640px] mx-auto ${className} pt-0 px-5 pb-8 md:px-8`}>
      <form onSubmit={handleSubmit}>
        <div className="flex w-full mb-6">
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
            disabled={!isEmailValid}
            variant="primary"
            size="large"
            className="w-full"
            onClick={handleUnlockSong}
          >
            <Lock className="w-5 h-5" />
            UNLOCK SONG
          </Button>
        </div>
      </form>
    </div>
  )
}
