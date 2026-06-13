'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { SchoolZoneMap } from './SchoolZoneMap'

interface SchoolResult {
  name: string
  type: 'primary' | 'secondary' | 'combined' | string
  address: string
  suburb: string
  website?: string
  education_sector?: string
  entityCode?: number
}

interface ZoneFeatureCollection {
  type: 'FeatureCollection'
  features: unknown[]
}

interface SearchState {
  status: 'idle' | 'geocoding' | 'searching' | 'done' | 'error'
  address: string
  results: SchoolResult[]
  zones: ZoneFeatureCollection | null
  errorMsg: string
  suburb: string
  lat: number | null
  lng: number | null
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

const STATE_PROXIMITY: Record<string, string> = {
  VIC: '145.0,-37.8', NSW: '151.2,-33.9', QLD: '153.0,-27.5',
  SA: '138.6,-34.9', WA: '115.9,-31.9', TAS: '147.3,-42.9',
  NT: '130.8,-12.5', ACT: '149.1,-35.3',
}

const STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']

const NON_VIC_RESOURCES: Record<string, { name: string; url: string; desc: string }[]> = {
  NSW: [
    { name: 'Find My Local School (NSW)', url: 'https://education.nsw.gov.au/schooling/going-to-a-government-school/find-your-local-school', desc: 'Official NSW Department of Education zone finder' },
  ],
  QLD: [
    { name: 'School Catchments (QLD)', url: 'https://schoolzones.eq.edu.au', desc: 'Official Queensland Education school catchment zone checker' },
  ],
  SA: [
    { name: 'Find a School (SA)', url: 'https://www.education.sa.gov.au/students-and-families/enrolment/find-school', desc: 'South Australia Department for Education school finder' },
  ],
  WA: [
    { name: 'Find a Public School (WA)', url: 'https://www.education.wa.edu.au/web/public-schools/find-a-school', desc: 'Western Australia school finder and local intake areas' },
  ],
  TAS: [
    { name: 'Find a School (TAS)', url: 'https://www.education.tas.gov.au/parents-carers/find-a-school/', desc: 'Tasmania Department for Education school directory' },
  ],
  NT: [
    { name: 'Find a School (NT)', url: 'https://education.nt.gov.au/schools-and-the-department/find-a-school', desc: 'Northern Territory school finder' },
  ],
  ACT: [
    { name: 'School Enrolment (ACT)', url: 'https://www.education.act.gov.au/public-school-life/enrolling-in-a-public-school', desc: 'ACT Education Directorate enrolment and zone info' },
  ],
}

export default function SchoolsPage() {
  const [activeState, setActiveState] = useState('VIC')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLngLat, setSelectedLngLat] = useState<[number, number] | null>(null)
  const [search, setSearch] = useState<SearchState>({
    status: 'idle', address: '', results: [], zones: null, errorMsg: '', suburb: '', lat: null, lng: null,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Clear state when switching tabs
  useEffect(() => {
    setQuery('')
    setSelectedLngLat(null)
    setSuggestions([])
    setShowSuggestions(false)
    setSearch({ status: 'idle', address: '', results: [], zones: null, errorMsg: '', suburb: '', lat: null, lng: null })
  }, [activeState])

  // Autocomplete suggestions
  useEffect(() => {
    if (debouncedQuery.length < 3 || selectedLngLat) { setSuggestions([]); return }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return
    const stateName = STATE_FULL_NAMES[activeState] ?? 'Australia'
    const proximity = STATE_PROXIMITY[activeState] ?? ''
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery + ', ' + stateName + ', Australia')}.json?access_token=${token}&country=AU${proximity ? '&proximity=' + proximity : ''}&limit=5&types=address,postcode,locality,neighborhood`
    )
      .then(r => r.json())
      .then((data: { features?: { place_name: string; center: [number, number] }[] }) => {
        setSuggestions(data.features ?? [])
        setShowSuggestions(true)
      })
      .catch(() => {})
  }, [debouncedQuery, selectedLngLat, activeState])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
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

  const runSearch = useCallback(async (address: string, lngLat: [number, number] | null) => {
    setSearch(s => ({ ...s, status: 'geocoding', address, results: [], zones: null, errorMsg: '', suburb: '' }))
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) throw new Error('Map token not configured')

      let lat: number, lng: number, resolvedAddress: string

      if (lngLat) {
        ;[lng, lat] = lngLat
        resolvedAddress = address
      } else {
        const stateName = STATE_FULL_NAMES[activeState] ?? 'Australia'
        const proximity = STATE_PROXIMITY[activeState] ?? ''
        const q = encodeURIComponent(`${address.trim()}, ${stateName}, Australia`)
        const geoRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${token}&country=AU${proximity ? '&proximity=' + proximity : ''}&limit=1`
        )
        const geoData = await geoRes.json() as { features?: { center: [number, number]; place_name: string }[] }
        const feature = geoData.features?.[0]
        if (!feature) throw new Error('Address not found — try a more specific street address')
        ;[lng, lat] = feature.center
        resolvedAddress = feature.place_name
      }

      setSearch(s => ({ ...s, status: 'searching', address: resolvedAddress }))

      if (activeState === 'VIC') {
        const res = await fetch(`/api/schools/zone?lat=${lat}&lng=${lng}`)
        if (!res.ok) throw new Error('School zone lookup failed')
        const data = await res.json() as { schools: SchoolResult[]; suburb: string; zones: ZoneFeatureCollection }
        setSearch({ status: 'done', address: resolvedAddress, results: data.schools, zones: data.zones, errorMsg: '', suburb: data.suburb, lat, lng })
      } else {
        // Non-VIC: no zone data, just show the resolved address + state resources
        const token2 = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        let suburb = ''
        if (token2) {
          const revRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token2}&types=neighborhood,locality&limit=1`)
          const revData = await revRes.json() as { features?: { text: string }[] }
          suburb = revData.features?.[0]?.text ?? ''
        }
        setSearch({ status: 'done', address: resolvedAddress, results: [], zones: { type: 'FeatureCollection', features: [] }, errorMsg: '', suburb, lat, lng })
      }
    } catch (err) {
      setSearch(s => ({ ...s, status: 'error', errorMsg: err instanceof Error ? err.message : 'Search failed' }))
    }
  }, [activeState])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setShowSuggestions(false)
    await runSearch(query, selectedLngLat)
  }

  function handleClear() {
    setQuery('')
    setSelectedLngLat(null)
    setSuggestions([])
    setShowSuggestions(false)
    setSearch({ status: 'idle', address: '', results: [], zones: null, errorMsg: '', suburb: '', lat: null, lng: null })
    inputRef.current?.focus()
  }

  const { status, address, results, zones, errorMsg, suburb, lat, lng } = search
  const isLoading = status === 'geocoding' || status === 'searching'
  const primarySchools = results.filter(s => s.type === 'primary')
  const secondarySchools = results.filter(s => s.type === 'secondary')
  const nonVicResources = NON_VIC_RESOURCES[activeState]

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">🏫 School Zone Checker</h1>
        <p className="text-gray-400 text-sm">Enter your home address to find which local government schools you are zoned for</p>
      </div>

      {/* State tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveState(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeState === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          {/* Search form */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedLngLat(null) }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder={
                    activeState === 'VIC' ? 'e.g. 45 Smith St, Oakleigh or postcode 3166' :
                    activeState === 'NSW' ? 'e.g. 12 Park Rd, Newtown or postcode 2042' :
                    activeState === 'QLD' ? 'e.g. 5 Queen St, Brisbane or postcode 4000' :
                    'e.g. street address or postcode'
                  }
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  disabled={isLoading}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div ref={dropdownRef} className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button key={i} type="button" onMouseDown={() => selectSuggestion(s)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-0">
                        <span className="text-gray-400 mr-2">📍</span>{s.place_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={isLoading || !query.trim()}
                className="px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {isLoading ? (status === 'geocoding' ? 'Locating…' : 'Searching…') : 'Check'}
              </button>
              {(query || status !== 'idle') && (
                <button type="button" onClick={handleClear}
                  className="px-4 py-3 border border-gray-200 bg-white text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Clear
                </button>
              )}
            </form>
            <p className="text-xs text-blue-400 mt-3">
              {activeState === 'VIC'
                ? 'Only Victorian government school zones are shown. Catholic and independent schools select their own students.'
                : `Zone boundary data for ${STATE_FULL_NAMES[activeState]} is not yet available in this tool. Use the official resources below.`}
            </p>
          </div>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">{errorMsg}</div>
          )}

          {/* Results */}
          {status === 'done' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Results for <span className="font-medium text-gray-700">{address}</span>
                {suburb && <> · <span className="text-blue-600">{suburb}</span></>}
              </p>

              {/* Map — VIC shows zone polygons, other states show just the address pin */}
              {lat !== null && lng !== null && zones !== null && (
                <SchoolZoneMap
                  centerLat={lat}
                  centerLng={lng}
                  zones={zones as Parameters<typeof SchoolZoneMap>[0]['zones']}
                />
              )}

              {activeState !== 'VIC' && nonVicResources && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <p className="font-semibold text-blue-800 mb-1">🏫 {STATE_FULL_NAMES[activeState]} school zone data not yet available</p>
                  <p className="text-sm text-blue-700 mb-4">
                    We don&apos;t have zone boundary data for {STATE_FULL_NAMES[activeState]} yet. Use the official tool below to check your zone.
                  </p>
                  <div className="space-y-2">
                    {nonVicResources.map(r => (
                      <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-xl bg-white border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all group">
                        <span className="text-xl shrink-0">🏫</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 group-hover:text-blue-900">{r.name} ↗</p>
                          <p className="text-xs text-gray-500">{r.desc}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeState === 'VIC' && results.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 mt-4">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-500 font-medium">No school zones found for this address</p>
                  <p className="text-gray-400 text-sm mt-2">Try entering a more specific street address</p>
                </div>
              )}

              {activeState === 'VIC' && results.length > 0 && (
                <div className="space-y-8 mt-6">
                  {primarySchools.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🎒</span>
                        <h2 className="font-semibold text-gray-700">Primary School</h2>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{primarySchools.length} zone{primarySchools.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-3">
                        {primarySchools.map((school, i) => <SchoolCard key={i} school={school} />)}
                      </div>
                    </section>
                  )}
                  {secondarySchools.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🎓</span>
                        <h2 className="font-semibold text-gray-700">Secondary School</h2>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{secondarySchools.length} zone{secondarySchools.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-3">
                        {secondarySchools.map((school, i) => <SchoolCard key={i} school={school} />)}
                      </div>
                    </section>
                  )}
                  <p className="text-xs text-gray-400 text-center pt-2">
                    Data source: Victorian Department of Education 2026 · School zones are approximate · Always verify with the school directly
                  </p>
                </div>
              )}
            </div>
          )}

          {status === 'idle' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {[
                { icon: '📍', title: 'Zone-based enrolment', desc: 'Government schools have catchment zones. Living in the zone guarantees your child a place.' },
                { icon: '🆓', title: 'Free education', desc: 'Australian government schools are free. No tuition fees for primary or secondary.' },
                { icon: '📋', title: 'How to enrol', desc: 'Contact the school directly. Bring proof of address, birth certificate, and immunisation records.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-2xl mb-2">{icon}</div>
                  <h3 className="font-semibold text-sm text-gray-800 mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-6">
            <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Official Resources</h2>
            <div className="space-y-3">
              {activeState === 'VIC' ? (
                <>
                  {[
                    { title: 'Find My School', desc: 'Official Victorian Dept of Education zone checker', url: 'https://www.findmyschool.vic.gov.au', icon: '🏫' },
                    { title: 'School Zones 2026', desc: 'Download 2026 zone GeoJSON data from data.vic.gov.au', url: 'https://discover.data.vic.gov.au/dataset/victorian-government-school-zones-2026', icon: '📂' },
                    { title: 'School Zones 2027', desc: 'Download 2027 zone GeoJSON data from data.vic.gov.au', url: 'https://discover.data.vic.gov.au/dataset/victorian-government-school-zones-2027', icon: '📂' },
                    { title: '2027 Zones Announcement', desc: 'What changed in the 2027 school zone update', url: 'https://www.schoolbuildings.vic.gov.au/2027-school-zones-now-available', icon: '📣' },
                  ].map(({ title, desc, url, icon }) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
                      <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors leading-snug">{title} ↗</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </a>
                  ))}
                </>
              ) : nonVicResources ? (
                nonVicResources.map(r => (
                  <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
                    <span className="text-xl shrink-0 mt-0.5">🏫</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors leading-snug">{r.name} ↗</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                  </a>
                ))
              ) : null}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                {activeState === 'VIC'
                  ? 'This tool uses official 2026 zone data. For the most up-to-date information, always verify with the school directly.'
                  : `Zone boundary data for ${STATE_FULL_NAMES[activeState]} is not yet integrated. Use the official state tool to check your zone.`}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

function SchoolCard({ school }: { school: SchoolResult }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-semibold text-gray-900">{school.name}</h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium shrink-0">Government</span>
      </div>
      {school.address && (
        <p className="text-sm text-gray-500 mt-1">{school.address}{school.suburb ? `, ${school.suburb}` : ''}</p>
      )}
      {school.website && (
        <a href={school.website} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
          Visit school website →
        </a>
      )}
    </div>
  )
}
