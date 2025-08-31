"use client"

import type React from "react"

import { ActivityItem } from "@/components/primitives/activity-item"

export function ActivityFeed() {
  const activities = [
    {
      type: "purchase" as const,
      message: "Someone bought this song for $40",
      timestamp: "1m ago",
      date: new Date(), // Today
    },
    {
      type: "play" as const,
      message: "Someone listened from New York, NY",
      timestamp: "3m ago",
      date: new Date(), // Today
    },
    {
      type: "purchase" as const,
      message: "Someone bought this song for $40",
      timestamp: "5m ago",
      date: new Date(), // Today
    },
    {
      type: "play" as const,
      message: "Someone listened from Los Angeles, CA",
      timestamp: "8m ago",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      type: "purchase" as const,
      message: "Someone bought this song for $40",
      timestamp: "12m ago",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      type: "play" as const,
      message: "Someone listened from Chicago, IL",
      timestamp: "15m ago",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      type: "play" as const,
      message: "Someone listened from Miami, FL",
      timestamp: "18m ago",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      type: "purchase" as const,
      message: "Someone bought this song for $40",
      timestamp: "22m ago",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ]

  const formatDateLabel = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
    }
  }

  const groupedActivities = activities.reduce(
    (groups, activity) => {
      const dateKey = activity.date.toDateString()

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: activity.date,
          activities: [],
        }
      }

      groups[dateKey].activities.push(activity)
      return groups
    },
    {} as Record<string, { date: Date; activities: typeof activities }>,
  )

  const sortedDateGroups = Object.values(groupedActivities).sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="px-6">
      <h2 className="text-2xl font-bold text-black mb-4">Activity</h2>

      <div
        className="max-h-80 overflow-y-auto space-y-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#9f8b79 transparent",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          div::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 0;
          }
          div::-webkit-scrollbar-thumb {
            background-color: #9f8b79 !important;
            border-radius: 4px;
            border: none;
            min-height: 20px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background-color: #867260 !important;
          }
          div::-webkit-scrollbar-corner {
            background: transparent;
          }
          @media (max-width: 768px) {
            div::-webkit-scrollbar {
              width: 6px;
              -webkit-appearance: none;
            }
            div::-webkit-scrollbar-thumb {
              background-color: #9f8b79 !important;
              border-radius: 3px;
              opacity: 1 !important;
            }
          }
        `}</style>
        {sortedDateGroups.map((dateGroup, dateIndex) => (
          <div key={dateGroup.date.toDateString()}>
            <h2 className="text-lg font-semibold text-black mb-2 mt-6 first:mt-0">{formatDateLabel(dateGroup.date)}</h2>

            {dateGroup.activities.reduce((typeGroups, activity, activityIndex) => {
              const prevActivity = dateGroup.activities[activityIndex - 1]
              const shouldShowTypeLabel = !prevActivity || prevActivity.type !== activity.type

              if (shouldShowTypeLabel) {
                typeGroups.push(
                  <h3
                    key={`${dateGroup.date.toDateString()}-${activity.type}-${activityIndex}`}
                    className="text-sm font-medium text-gray-500 mt-4 first:mt-0"
                  >
                    {activity.type === "purchase" ? "Purchase" : "Song Play"}
                  </h3>,
                )
              }

              typeGroups.push(
                <ActivityItem
                  key={`${dateGroup.date.toDateString()}-${activityIndex}`}
                  type={activity.type}
                  message={activity.message}
                  timestamp={activity.timestamp}
                />,
              )

              return typeGroups
            }, [] as React.ReactNode[])}
          </div>
        ))}
      </div>
    </div>
  )
}
