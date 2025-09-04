"use client"

import type React from "react"
import useSWR from "swr"
import { useMemo } from "react"
import { ActivityItem } from "@/components/primitives/activity-item"

type Item = {
  type: "purchase" | "play"
  message: string
  timestampIso: string // ISO from server
  date: string         // same ISO, used for grouping
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ActivityFeed() {
  const { data, error, isLoading } = useSWR<{ ok: boolean; items: Item[] }>(
    "/api/activity",
    fetcher,
    { refreshInterval: 20000 } // refresh every 20s
  )

  const activities: Item[] = data?.ok ? data.items : []

  const formatDateLabel = (iso: string) => {
    const date = new Date(iso)
    const today = new Date()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
  }

  const grouped = useMemo(() => {
    const byDay: Record<string, { dateIso: string; activities: Item[] }> = {}
    for (const a of activities) {
      const key = new Date(a.date).toDateString()
      if (!byDay[key]) byDay[key] = { dateIso: a.date, activities: [] }
      byDay[key].activities.push(a)
    }
    return Object.values(byDay).sort(
      (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
    )
  }, [activities])

  return (
    <div className="px-6">
      <h2 className="text-2xl font-bold text-black mb-4">Activity</h2>

      <div className="space-y-1">

        <style jsx>{`
          div::-webkit-scrollbar { width: 8px; height: 8px; }
          div::-webkit-scrollbar-track { background: transparent; border-radius: 0; }
          div::-webkit-scrollbar-thumb { background-color: #9f8b79 !important; border-radius: 4px; border: none; min-height: 20px; }
          div::-webkit-scrollbar-thumb:hover { background-color: #867260 !important; }
          div::-webkit-scrollbar-corner { background: transparent; }
          @media (max-width: 768px) {
            div::-webkit-scrollbar { width: 6px; -webkit-appearance: none; }
            div::-webkit-scrollbar-thumb { background-color: #9f8b79 !important; border-radius: 3px; opacity: 1 !important; }
          }
        `}</style>

        {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {error && <p className="text-sm text-red-500">Couldn’t load activity.</p>}

        {!isLoading && !error && grouped.map((group) => (
          <div key={new Date(group.dateIso).toDateString()}>
            <h2 className="text-lg font-semibold text-black mb-2 mt-6 first:mt-0">
              {formatDateLabel(group.dateIso)}
            </h2>

            {group.activities.reduce((nodes: React.ReactNode[], activity, idx) => {
              const prev = group.activities[idx - 1]
              const showTypeLabel = !prev || prev.type !== activity.type

              if (showTypeLabel) {
                nodes.push(
                  <h3
                    key={`${group.dateIso}-${activity.type}-label-${idx}`}
                    className="text-sm font-medium text-gray-500 mt-4 first:mt-0"
                  >
                    {activity.type === "purchase" ? "Purchase" : "Song Play"}
                  </h3>
                )
              }

              // Simple "time ago"
              const ago = timeAgo(new Date(activity.timestampIso))

              nodes.push(
                <ActivityItem
                  key={`${group.dateIso}-${idx}`}
                  type={activity.type}
                  message={activity.message}
                  timestamp={ago}
                />
              )
              return nodes
            }, [])}
          </div>
        ))}
      </div>
    </div>
  )
}

// tiny helper
function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ]
  for (const [unit, secs] of units) {
    const val = Math.floor(seconds / secs)
    if (val >= 1) return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-val, unit)
  }
  return "just now"
}
