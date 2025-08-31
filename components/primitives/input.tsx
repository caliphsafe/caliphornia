import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: "default" | "large"
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, size = "default", ...props }, ref) => {
  return (
    <input
      className={cn(
        // Base styles
        "w-full px-4 rounded-none focus:ring-0 focus:outline-none transition-colors",
        "placeholder:text-gray-400 shadow-none",
        // Size variants
        size === "default" && "h-12 text-base",
        size === "large" && "h-14 md:h-16 text-lg",
        className,
      )}
      style={{
        border: "1px solid rgba(0, 0, 0, 0.12)",
        background: "#F6F6F3",
      }}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
