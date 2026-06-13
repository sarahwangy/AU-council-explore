'use client'
import { useState } from 'react'
import { FavoriteLibraryButton } from '@/components/FavoriteLibraryButton'

export interface LibraryItem {
  id: string
  name: string
  councilId: string
  address: string | null
  suburb: string | null
  url: string | null
  phone: string | null
  lat: number | null
  lng: number | null
  hoursJson: string | null
}

export interface NearbyLibrary extends LibraryItem {
  distance: number
}

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

export function getOpenStatus(hoursJson: string | null): { todayHours: string | null; isOpen: boolean } | null {
  if (!hoursJson) return null
  try {
    const hours = JSON.parse(hoursJson) as Record<string, string | null>
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Melbourne' }))
    const dayKey = DAYS[now.getDay()]
    const todayHours = hours[dayKey] ?? null
    if (!todayHours) return { todayHours: null, isOpen: false }
    const [open, close] = todayHours.split('-').map(t => t.trim())
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m ?? 0) }
    const nowMins = now.getHours() * 60 + now.getMinutes()
    return { todayHours, isOpen: nowMins >= toMins(open) && nowMins < toMins(close) }
  } catch { return null }
}

export function LibraryCard({ lib, rank, distance }: { lib: LibraryItem | NearbyLibrary; rank?: number; distance?: number }) {
  const status = getOpenStatus(lib.hoursJson)
  const [expanded, setExpanded] = useState(false)
  let hours: Record<string, string | null> | null = null
  try { hours = lib.hoursJson ? JSON.parse(lib.hoursJson) : null } catch { /* */ }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {rank !== undefined ? (
            <div className="shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
              {rank}
            </div>
          ) : (
            <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-lg">📚</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {lib.url ? (
                  <a href={lib.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-gray-900 hover:text-purple-700 transition-colors leading-snug">
                    {lib.name}
                  </a>
                ) : (
                  <p className="font-semibold text-sm text-gray-900 leading-snug">{lib.name}</p>
                )}
                {lib.address && (
                  <p className="text-xs text-gray-500 mt-0.5">{lib.address}{lib.suburb ? `, ${lib.suburb}` : ''}</p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {distance !== undefined && (
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                  </span>
                )}
                <FavoriteLibraryButton libraryId={lib.id} />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {status ? (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {status.isOpen ? '🟢 Open now' : '🔴 Closed'}
                  {status.todayHours && ` · ${status.todayHours}`}
                </span>
              ) : (
                <span className="text-xs text-gray-400">Hours unknown</span>
              )}
              {lib.phone && <span className="text-xs text-gray-400">{lib.phone}</span>}
            </div>

            {hours && (
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="mt-2 text-xs text-purple-600 hover:text-purple-800 transition-colors"
              >
                {expanded ? '▲ Hide hours' : '▼ Show all hours'}
              </button>
            )}
            {expanded && hours && (
              <div className="mt-2 grid grid-cols-4 gap-x-4 gap-y-1">
                {DAYS.slice(1).concat('sun').map(day => (
                  <div key={day} className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 w-7">{DAY_LABELS[day]}</span>
                    <span className="text-xs text-gray-600">{hours![day] ?? 'Closed'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
