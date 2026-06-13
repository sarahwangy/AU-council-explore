'use client'
import { useState, useRef, useEffect } from 'react'
import { LibraryCard } from './LibraryCard'
import { NearbyMap } from './NearbyMap'

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

interface Suggestion {
  place_name: string
  center: [number, number]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const STATE_FULL_NAMES: Record<string, string> = {
  VIC: 'Victoria', NSW: 'New South Wales', QLD: 'Queensland',
  SA: 'South Australia', WA: 'Western Australia', TAS: 'Tasmania',
  NT: 'Northern Territory', ACT: 'Australian Capital Territory',
}

export function NearbySearch({ activeState = 'VIC' }: { activeState?: string }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLngLat, setSelectedLngLat] = useState<[number, number] | null>(null)
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null)
  const [nearbyResults, setNearbyResults] = useState<NearbyLibrary[] | null>(null)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedQuery.length < 3 || selectedLngLat) {
      setSuggestions([])
      return
    }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return
    const stateName = STATE_FULL_NAMES[activeState] ?? 'Australia'
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery + ', ' + stateName + ', Australia')}.json?access_token=${token}&country=AU&limit=5&types=address,postcode,locality,neighborhood`
    )
      .then(r => r.json())
      .then((data: { features?: { place_name: string; center: [number, number] }[] }) => {
        setSuggestions(data.features ?? [])
        setShowSuggestions(true)
      })
      .catch(() => {})
  }, [debouncedQuery, selectedLngLat, activeState])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectSuggestion(s: Suggestion) {
    setQuery(s.place_name)
    setSelectedLngLat(s.center)
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  async function searchNearby(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setShowSuggestions(false)
    setNearbyLoading(true)
    setNearbyError('')
    setNearbyResults(null)
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) { setNearbyError('Map token not configured'); return }

      let lat: number, lng: number
      if (selectedLngLat) {
        ;[lng, lat] = selectedLngLat
      } else {
        const stateName = STATE_FULL_NAMES[activeState] ?? 'Australia'
        const q = encodeURIComponent(`${query.trim()}, ${stateName}, Australia`)
        const geoRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${token}&country=AU&limit=1`)
        const geoData = await geoRes.json() as { features?: { center: [number, number] }[] }
        const feature = geoData.features?.[0]
        if (!feature) { setNearbyError('Suburb not found — try another name'); return }
        ;[lng, lat] = feature.center
      }

      const res = await fetch(`/api/libraries/nearby?lat=${lat}&lng=${lng}&limit=8&state=${activeState}`)
      setSearchCenter([lng, lat])
      setNearbyResults(await res.json())
    } catch {
      setNearbyError('Search failed — please try again')
    } finally {
      setNearbyLoading(false)
    }
  }

  function handleClear() {
    setQuery('')
    setSelectedLngLat(null)
    setSuggestions([])
    setShowSuggestions(false)
    setNearbyResults(null)
    setNearbyError('')
    setSearchCenter(null)
    inputRef.current?.focus()
  }

  return (
    <section className="mb-10">
      <div className="bg-linear-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6">
        <h2 className="text-base font-semibold text-purple-800 mb-1">Find libraries near you</h2>
        <p className="text-sm text-purple-500 mb-4">
          Enter your suburb or address to find the closest libraries in {STATE_FULL_NAMES[activeState] ?? activeState}
        </p>
        <form onSubmit={searchNearby} className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedLngLat(null) }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={activeState === 'VIC' ? 'e.g. Fitzroy, Clayton, 3168…' : activeState === 'NSW' ? 'e.g. Newtown, Parramatta…' : activeState === 'QLD' ? 'e.g. Brisbane CBD, Cairns…' : 'e.g. suburb or postcode…'}
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-400 mr-2">📍</span>
                    {s.place_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={nearbyLoading || !query.trim()}
            className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {nearbyLoading ? 'Searching…' : 'Search'}
          </button>
          {(query || nearbyResults) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 border border-gray-200 bg-white text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {nearbyError && <p className="mt-3 text-sm text-red-500">{nearbyError}</p>}
        {nearbyResults && nearbyResults.length === 0 && (
          <p className="mt-3 text-sm text-gray-400">No libraries found near this location.</p>
        )}
        {nearbyResults && nearbyResults.length > 0 && (
          <>
            {searchCenter && (
              <NearbyMap
                libraries={nearbyResults}
                centerLng={searchCenter[0]}
                centerLat={searchCenter[1]}
              />
            )}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nearbyResults.map((lib, i) => (
                <LibraryCard key={lib.id} lib={lib} rank={i + 1} distance={lib.distance} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
