'use client'
import { useState, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

const PlaygroundMapView = dynamic(() => import('./PlaygroundMapView'), { ssr: false })

interface Playground {
  id: string
  name: string | null
  lat: number
  lng: number
  suburb: string | null
  fenced: boolean | null
  shaded: boolean | null
  hasBbq: boolean | null
  hasToilet: boolean | null
  surfaceType: string | null
  distance?: number
}

export function PlaygroundClient() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ place_name: string; center: [number, number] }[]>([])
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [results, setResults] = useState<Playground[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ fenced: false, shaded: false, bbq: false, toilet: false })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) return
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${token}&country=AU&proximity=145.0,-37.8&types=locality,neighborhood,postcode&limit=5`
      )
      const data = await res.json() as { features: { place_name: string; center: [number, number] }[] }
      setSuggestions(data.features ?? [])
    }, 300)
  }, [])

  async function search(lat: number, lng: number, label: string) {
    setQuery(label)
    setSuggestions([])
    setSelectedLat(lat)
    setSelectedLng(lng)
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/liveability/nearby?lat=${lat}&lng=${lng}&type=playground&limit=30`)
      const data = await res.json() as Playground[]
      setResults(data)
    } catch {
      setError('Search failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () => results
      ? results.filter(p =>
          (!filters.fenced || p.fenced === true) &&
          (!filters.shaded || p.shaded === true) &&
          (!filters.bbq || p.hasBbq === true) &&
          (!filters.toilet || p.hasToilet === true)
        )
      : null,
    [results, filters]
  )

  const mapItems = useMemo(
    () => filtered?.map(p => ({ id: p.id, name: p.name ?? (p.suburb ? `Playground – ${p.suburb}` : 'Playground'), lat: p.lat, lng: p.lng })) ?? [],
    [filtered]
  )

  const FeatureBadge = ({ label, value }: { label: string; value: boolean | null }) => {
    if (value === null) return null
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 line-through'}`}>
        {label}
      </span>
    )
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-6 relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value) }}
            placeholder="Enter suburb or postcode (e.g. Richmond, 3121)"
            className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); setResults(null); setSelectedLat(null); setSelectedLng(null) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
            >×</button>
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button type="button" key={i} onClick={() => search(s.center[1], s.center[0], s.place_name)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0">
                📍 {s.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      {results && (
        <div className="mb-4 flex gap-2 flex-wrap items-center">
          <span className="text-xs text-gray-500 font-medium">Filter:</span>
          {([['fenced', 'Fenced'], ['shaded', 'Shaded'], ['bbq', 'BBQ'], ['toilet', 'Toilet']] as const).map(([key, label]) => (
            <button type="button" key={key} onClick={() => setFilters(f => ({ ...f, [key]: !f[key] }))}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters[key] ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading && (
        <div className="space-y-3">{[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-16" />
        ))}</div>
      )}

      {!loading && filtered !== null && (
        <div className={selectedLat ? 'flex gap-5 flex-col lg:flex-row' : ''}>
          {selectedLat && selectedLng && (
            <div className="lg:w-3/5 shrink-0 rounded-2xl overflow-hidden border border-green-100 shadow-sm h-105 lg:h-155">
              <PlaygroundMapView
                centerLat={selectedLat} centerLng={selectedLng}
                selectedId={selectedId}
                items={mapItems}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">🛝</div>
                <p className="text-gray-500 font-medium">No playgrounds match your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-2">{filtered.length} playground{filtered.length !== 1 ? 's' : ''} within 5km</p>
                {filtered.map((p, i) => (
                  <div key={p.id} onClick={() => setSelectedId(p.id)} className={`bg-white rounded-xl border shadow-sm hover:border-green-200 hover:shadow-md transition-all p-3 cursor-pointer ${selectedId === p.id ? 'border-green-400 ring-1 ring-green-300' : 'border-gray-100'}`}>
                    <div className="flex gap-3 items-center">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {p.name ?? <span className="text-gray-400 font-normal">Playground #{i + 1}</span>}
                          </p>
                          {p.distance !== undefined && (
                            <span className="text-xs text-gray-400 shrink-0">
                              {p.distance < 1 ? `${Math.round(p.distance * 1000)}m` : `${p.distance.toFixed(1)}km`}
                            </span>
                          )}
                        </div>
                        {p.suburb && <p className="text-xs text-gray-400">📍 {p.suburb}</p>}
                        <div className="flex gap-1 flex-wrap mt-1">
                          <FeatureBadge label="Fenced" value={p.fenced} />
                          <FeatureBadge label="Shaded" value={p.shaded} />
                          <FeatureBadge label="BBQ" value={p.hasBbq} />
                          <FeatureBadge label="Toilet" value={p.hasToilet} />
                          {p.surfaceType && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{p.surfaceType}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && results === null && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🛝</div>
          <p className="font-medium text-gray-500">Search a suburb to find playgrounds</p>
          <p className="text-sm mt-1">Shows playgrounds within 5km · Filter by features</p>
        </div>
      )}
    </div>
  )
}
