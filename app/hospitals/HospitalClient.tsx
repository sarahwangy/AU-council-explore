'use client'
import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

const HospitalMapView = dynamic(() => import('./HospitalMapView'), { ssr: false })

interface Hospital {
  id: string
  name: string
  hospitalType: string | null
  address: string | null
  suburb: string | null
  lat: number
  lng: number
  phone: string | null
  website: string | null
  emergencyAvailable: boolean
  distance?: number
}

export function HospitalClient() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ place_name: string; center: [number, number] }[]>([])
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [results, setResults] = useState<Hospital[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) return
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${token}&country=AU&proximity=145.0,-37.8&types=locality,neighborhood,postcode,address&limit=5`
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
      const res = await fetch(`/api/liveability/nearby?lat=${lat}&lng=${lng}&type=hospital&limit=20`)
      const data = await res.json() as Hospital[]
      setResults(data)
    } catch {
      setError('Search failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const filtered = results
    ? emergencyOnly ? results.filter(h => h.emergencyAvailable) : results
    : null

  return (
    <div>
      <div className="mb-6 relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value) }}
            placeholder="Enter suburb, postcode or address"
            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 shadow-sm"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => search(s.center[1], s.center[0], s.place_name)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 transition-colors border-b border-gray-50 last:border-0">
                📍 {s.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {results && (
        <div className="mb-4 flex gap-2 items-center">
          <button onClick={() => setEmergencyOnly(v => !v)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              emergencyOnly ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            🚨 Emergency only
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-20" />)}</div>}

      {!loading && filtered !== null && (
        <div className={selectedLat ? 'flex gap-4 flex-col lg:flex-row' : ''}>
          {selectedLat && selectedLng && (
            <div className="lg:w-1/2 shrink-0 rounded-2xl overflow-hidden border border-red-100 shadow-sm h-80 lg:h-[560px]">
              <HospitalMapView centerLat={selectedLat} centerLng={selectedLng}
                items={filtered.map(h => ({ id: h.id, name: h.name, lat: h.lat, lng: h.lng, emergency: h.emergencyAvailable }))}
              />
            </div>
          )}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">🏥</div>
                <p className="text-gray-500 font-medium">No hospitals found nearby</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-2">{filtered.length} hospital{filtered.length !== 1 ? 's' : ''} within 5km</p>
                {filtered.map((h, i) => (
                  <div key={h.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-red-200 hover:shadow-md transition-all p-4">
                    <div className="flex gap-3 items-start">
                      <div className="shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 leading-snug">
                            {h.website
                              ? <a href={h.website} target="_blank" rel="noopener noreferrer" className="hover:text-red-700 transition-colors">{h.name}</a>
                              : h.name}
                          </p>
                          {h.distance !== undefined && (
                            <span className="text-xs text-gray-400 shrink-0">
                              {h.distance < 1 ? `${Math.round(h.distance * 1000)}m` : `${h.distance.toFixed(1)}km`}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {h.emergencyAvailable && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">🚨 Emergency</span>
                          )}
                          {h.hospitalType && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{h.hospitalType}</span>
                          )}
                        </div>
                        {(h.address || h.suburb) && (
                          <p className="text-xs text-gray-500 mt-1.5">📍 {[h.address, h.suburb].filter(Boolean).join(', ')}</p>
                        )}
                        {h.phone && <p className="text-xs text-gray-500 mt-1">📞 {h.phone}</p>}
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
          <div className="text-5xl mb-4">🏥</div>
          <p className="font-medium text-gray-500">Search a suburb or address to find nearby hospitals</p>
          <p className="text-sm mt-1">Shows hospitals within 5km radius</p>
        </div>
      )}
    </div>
  )
}
