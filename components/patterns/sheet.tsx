"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function Sheet({ isOpen, onClose, children }: SheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/50">
      {/* Background overlay */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Sheet container */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F3F2EE] rounded-t-3xl shadow-lg transform transition-transform duration-300 ease-out min-h-[50vh] max-h-[90vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1 bg-[#9f8b79] rounded-full cursor-pointer" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  )
}
