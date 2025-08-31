import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  size?: "default" | "large"
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "font-bold flex items-center justify-center gap-3 rounded-none transition-colors",
          // Size variants
          size === "default" && "h-12 px-6 text-base",
          size === "large" && "h-16 md:h-18 px-8 text-lg",
          // Variant styles
          variant === "primary" && [
            disabled
              ? "bg-[#302822] text-white opacity-20 cursor-not-allowed"
              : "bg-[#302822] hover:bg-[#252018] text-white cursor-pointer",
          ],
          variant === "secondary" && [
            disabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300 text-gray-900 cursor-pointer",
          ],
          className,
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export { Button }
