'use client'
import { useState, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

interface Childcare {
  id: string
  name: string
  serviceType: string | null
  address: string | null
  suburb: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  website: string | null
  qualityRating: string | null
  operatingHours: string | null
  vacancyStatus: string | null
  distance?: number
}

const RATING_COLOR: Record<string, string> = {
  'Exceeding NQS': 'bg-emerald-100 text-emerald-700',
  'Meeting NQS': 'bg-blue-100 text-blue-700',
  'Working Towards NQS': 'bg-amber-100 text-amber-700',
  'Significant Improvement Required': 'bg-red-100 text-red-700',
}

const SERVICE_TYPES = ['All', 'Long Day Care', 'Kindergarten / Preschool', 'Outside School Hours Care', 'Family Day Care']

export function ChildcareClient() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ place_name: string; center: [number, number] }[]>([])
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [results, setResults] = useState<Childcare[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showMap, setShowMap] = useState(true)
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
      const res = await fetch(`/api/liveability/nearby?lat=${lat}&lng=${lng}&type=childcare&limit=20`)
      const data = await res.json() as Childcare[]
      setResults(data)
    } catch {
      setError('Search failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () => results
      ? typeFilter === 'All' ? results : results.filter(r => r.serviceType === typeFilter)
      : null,
    [results, typeFilter]
  )

  const mapItems = useMemo(
    () => filtered?.filter(r => r.lat && r.lng).map(r => ({ id: r.id, name: r.name, lat: r.lat!, lng: r.lng!, type: r.serviceType ?? '', rating: r.qualityRating ?? '' })) ?? [],
    [filtered]
  )

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value) }}
            placeholder="Enter suburb or postcode (e.g. Clayton, 3168)"
            className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSuggestions([])
                setResults(null)
                setSelectedLat(null)
                setSelectedLng(null)
                setError('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                type="button"
                key={i}
                onClick={() => search(s.center[1], s.center[0], s.place_name)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0"
              >
                📍 {s.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      {results && results.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap items-center">
          <span className="text-xs text-gray-500 font-medium">Type:</span>
          {SERVICE_TYPES.map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowMap(v => !v)}
            className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {showMap ? '📋 List only' : '🗺 Show map'}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-20" />
          ))}
        </div>
      )}

      {!loading && filtered !== null && (
        <div className={showMap && selectedLat ? 'flex gap-4 flex-col lg:flex-row' : ''}>
          {/* Map */}
          {showMap && selectedLat && selectedLng && (
            <div className="lg:w-3/5 shrink-0">
              <div className="rounded-2xl overflow-hidden border border-purple-100 shadow-sm h-105 lg:h-155">
                <MapView
                  centerLat={selectedLat}
                  centerLng={selectedLng}
                  selectedId={selectedId}
                  items={mapItems}
                />
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">👶</div>
                <p className="text-gray-500 font-medium">No childcare centres found nearby</p>
                <p className="text-gray-400 text-sm mt-1">Try a different suburb or remove filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-2">{filtered.length} centre{filtered.length !== 1 ? 's' : ''} within 5km</p>
                {filtered.map((c, i) => (
                  <div key={c.id} onClick={() => setSelectedId(c.id)} className={`bg-white rounded-xl border shadow-sm hover:border-purple-200 hover:shadow-md transition-all p-4 cursor-pointer ${selectedId === c.id ? 'border-purple-400 ring-1 ring-purple-300' : 'border-gray-100'}`}>
                    <div className="flex gap-3 items-start">
                      <div className="shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 leading-snug">
                            {c.website ? (
                              <a href={c.website} target="_blank" rel="noopener noreferrer" className="hover:text-purple-700 transition-colors">
                                {c.name}
                              </a>
                            ) : c.name}
                          </p>
                          {c.distance !== undefined && (
                            <span className="text-xs text-gray-400 shrink-0">
                              {c.distance < 1 ? `${Math.round(c.distance * 1000)}m` : `${c.distance.toFixed(1)}km`}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {c.serviceType && (
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{c.serviceType}</span>
                          )}
                          {c.qualityRating && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${RATING_COLOR[c.qualityRating] ?? 'bg-gray-100 text-gray-600'}`}>
                              ⭐ {c.qualityRating}
                            </span>
                          )}
                          {c.vacancyStatus && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              c.vacancyStatus === 'Vacancies' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                            }`}>
                              {c.vacancyStatus}
                            </span>
                          )}
                        </div>
                        {c.address && (
                          <p className="text-xs text-gray-500 mt-1.5">
                            📍 {c.address}{c.suburb ? `, ${c.suburb}` : ''}
                          </p>
                        )}
                        <div className="flex gap-3 mt-1">
                          {c.phone && <p className="text-xs text-gray-500">📞 {c.phone}</p>}
                          {c.operatingHours && <p className="text-xs text-gray-500">🕐 {c.operatingHours}</p>}
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
          <div className="text-5xl mb-4">👶</div>
          <p className="font-medium text-gray-500">Search a suburb to find childcare centres</p>
          <p className="text-sm mt-1">Shows centres within 5km radius</p>
        </div>
      )}
    </div>
  )
}
