import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
  type: "purchase" | "play"
  message: string
  timestamp: string
  className?: string
}

const ActivityItem = forwardRef<HTMLDivElement, ActivityItemProps>(({ type, message, timestamp, className }, ref) => {
  return (
    <div className={cn("flex items-center gap-3 py-3", className)} ref={ref}>
      {/* Icon */}
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
        {type === "purchase" ? <span className="text-2xl">💰</span> : <span className="text-2xl">🎧</span>}
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-black font-medium">{message}</p>
      </div>

      {/* Timestamp */}
      <div className="text-gray-500 text-sm">{timestamp}</div>
    </div>
  )
})

ActivityItem.displayName = "ActivityItem"

export { ActivityItem }
