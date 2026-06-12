'use client'
import { useEffect, useState, useRef } from 'react'

interface LibraryItem {
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

interface NearbyLibrary extends LibraryItem {
  distance: number
}

interface GroupedCouncil {
  id: string
  name: string
  libraries: LibraryItem[]
}

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

function getOpenStatus(hoursJson: string | null): { todayHours: string | null; isOpen: boolean } | null {
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

function LibraryCard({ lib, rank, distance }: { lib: LibraryItem | NearbyLibrary; rank?: number; distance?: number }) {
  const status = getOpenStatus(lib.hoursJson)
  const [expanded, setExpanded] = useState(false)
  let hours: Record<string, string | null> | null = null
  try { hours = lib.hoursJson ? JSON.parse(lib.hoursJson) : null } catch { /* */ }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {rank !== undefined && (
            <div className="shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
              {rank}
            </div>
          )}
          {rank === undefined && (
            <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-lg">📚</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
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
              <div className="shrink-0 text-right">
                {distance !== undefined && (
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                  </span>
                )}
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

export default function LibrariesPage() {
  const [allLibraries, setAllLibraries] = useState<LibraryItem[]>([])
  const [grouped, setGrouped] = useState<GroupedCouncil[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [suburbQuery, setSuburbQuery] = useState('')
  const [nearbyResults, setNearbyResults] = useState<NearbyLibrary[] | null>(null)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState('')
  const [councilFilter, setCouncilFilter] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/libraries?map=true')
      .then(r => r.json())
      .then((data: LibraryItem[]) => {
        setAllLibraries(data)
        // Group by councilId
        const map = new Map<string, LibraryItem[]>()
        for (const lib of data) {
          if (!map.has(lib.councilId)) map.set(lib.councilId, [])
          map.get(lib.councilId)!.push(lib)
        }
        const groups: GroupedCouncil[] = Array.from(map.entries())
          .map(([id, libs]) => ({
            id,
            name: id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
            libraries: libs.sort((a, b) => a.name.localeCompare(b.name)),
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
        setGrouped(groups)
      })
      .finally(() => setLoadingAll(false))
  }, [])

  async function searchNearby(e: React.FormEvent) {
    e.preventDefault()
    if (!suburbQuery.trim()) return
    setNearbyLoading(true)
    setNearbyError('')
    setNearbyResults(null)
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) { setNearbyError('Map token not configured'); return }
      const query = encodeURIComponent(`${suburbQuery.trim()}, Victoria, Australia`)
      const geoRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&country=AU&proximity=145.0,-37.8&limit=1`)
      const geoData = await geoRes.json() as { features?: { center: [number, number] }[] }
      const feature = geoData.features?.[0]
      if (!feature) { setNearbyError('Suburb not found — try another name'); return }
      const [lng, lat] = feature.center
      const res = await fetch(`/api/libraries/nearby?lat=${lat}&lng=${lng}&limit=8`)
      setNearbyResults(await res.json())
    } catch {
      setNearbyError('Search failed — please try again')
    } finally {
      setNearbyLoading(false)
    }
  }

  const filteredGroups = councilFilter
    ? grouped.filter(g => g.id === councilFilter)
    : grouped

  const totalCount = allLibraries.length

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-1">📚 Libraries</h1>
        <p className="text-gray-400 text-sm">{totalCount} branches across 31 Melbourne councils</p>
      </div>

      {/* Nearby search */}
      <section className="mb-10">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6">
          <h2 className="text-base font-semibold text-purple-800 mb-1">Find libraries near you</h2>
          <p className="text-sm text-purple-500 mb-4">Enter your suburb to find the 8 closest libraries</p>
          <form onSubmit={searchNearby} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={suburbQuery}
              onChange={e => setSuburbQuery(e.target.value)}
              placeholder="e.g. Fitzroy, Clayton, Ringwood…"
              className="flex-1 px-4 py-2.5 border border-purple-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={nearbyLoading || !suburbQuery.trim()}
              className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {nearbyLoading ? 'Searching…' : 'Search'}
            </button>
            {(suburbQuery || nearbyResults) && (
              <button
                type="button"
                onClick={() => { setSuburbQuery(''); setNearbyResults(null); setNearbyError(''); inputRef.current?.focus() }}
                className="px-4 py-2.5 border border-gray-200 bg-white text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </form>

          {nearbyError && <p className="mt-3 text-sm text-red-500">{nearbyError}</p>}

          {nearbyResults && nearbyResults.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">No libraries found near this suburb.</p>
          )}

          {nearbyResults && nearbyResults.length > 0 && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nearbyResults.map((lib, i) => (
                <LibraryCard key={lib.id} lib={lib} rank={i + 1} distance={lib.distance} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Council filter + full list */}
      <section>
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Libraries</h2>
          <select
            value={councilFilter}
            onChange={e => setCouncilFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
          >
            <option value="">All councils</option>
            {grouped.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.libraries.length})</option>
            ))}
          </select>
        </div>

        {loadingAll && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-24" />
            ))}
          </div>
        )}

        {!loadingAll && (
          <div className="space-y-8">
            {filteredGroups.map(group => (
              <div key={group.id}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                  {group.name}
                  <span className="font-normal text-gray-400">({group.libraries.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.libraries.map(lib => (
                    <LibraryCard key={lib.id} lib={lib} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
