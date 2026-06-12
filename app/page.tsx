'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const REGION_COLORS: Record<string, string> = {
  inner: '#7c3aed',
  eastern: '#2563eb',
  southern: '#16a34a',
  northern: '#ea580c',
  western: '#dc2626',
  outer: '#6b7280',
  regional: '#0891b2',
}

const REGION_LABELS: Record<string, string> = {
  inner: 'Inner', eastern: 'Eastern', southern: 'Southern',
  northern: 'Northern', western: 'Western', outer: 'Outer',
  regional: 'Regional',
}

interface Council {
  id: string
  name: string
  region: string
  population?: number | null
  _count?: { events: number }
}

interface LibraryPin {
  id: string
  name: string
  councilId: string
  address: string | null
  suburb: string | null
  url: string | null
  lat: number
  lng: number
  hoursJson: string | null
}

interface UniversityPin {
  name: string
  shortName: string
  campus: string
  lat: number
  lng: number
  url: string
  color: string
}

const UNIVERSITIES: UniversityPin[] = [
  { name: 'University of Melbourne', shortName: 'UniMelb', campus: 'Parkville', lat: -37.7963, lng: 144.9614, url: 'https://www.unimelb.edu.au', color: '#003087' },
  { name: 'Monash University', shortName: 'Monash', campus: 'Clayton', lat: -37.9105, lng: 145.1362, url: 'https://www.monash.edu', color: '#006CAB' },
  { name: 'Monash University', shortName: 'Monash', campus: 'Caulfield', lat: -37.8783, lng: 145.0432, url: 'https://www.monash.edu/campuses/caulfield', color: '#006CAB' },
  { name: 'RMIT University', shortName: 'RMIT', campus: 'City', lat: -37.8080, lng: 144.9622, url: 'https://www.rmit.edu.au', color: '#E61E2A' },
  { name: 'RMIT University', shortName: 'RMIT', campus: 'Bundoora', lat: -37.7072, lng: 145.0495, url: 'https://www.rmit.edu.au/about/our-locations/bundoora', color: '#E61E2A' },
  { name: 'Deakin University', shortName: 'Deakin', campus: 'Burwood', lat: -37.8469, lng: 145.1153, url: 'https://www.deakin.edu.au/burwood', color: '#00A94F' },
  { name: 'Deakin University', shortName: 'Deakin', campus: 'Geelong Waurn Ponds', lat: -38.1951, lng: 144.2965, url: 'https://www.deakin.edu.au/geelong', color: '#00A94F' },
  { name: 'Deakin University', shortName: 'Deakin', campus: 'Geelong Waterfront', lat: -38.1455, lng: 144.3617, url: 'https://www.deakin.edu.au/geelong', color: '#00A94F' },
  { name: 'La Trobe University', shortName: 'La Trobe', campus: 'Bundoora', lat: -37.7215, lng: 145.0481, url: 'https://www.latrobe.edu.au', color: '#BE2BBB' },
  { name: 'Swinburne University', shortName: 'Swinburne', campus: 'Hawthorn', lat: -37.8225, lng: 145.0378, url: 'https://www.swinburne.edu.au', color: '#C41230' },
  { name: 'Victoria University', shortName: 'VU', campus: 'Footscray', lat: -37.7993, lng: 144.8996, url: 'https://www.vu.edu.au', color: '#00427A' },
  { name: 'Australian Catholic University', shortName: 'ACU', campus: 'Melbourne', lat: -37.8058, lng: 144.9626, url: 'https://www.acu.edu.au', color: '#1B3A6B' },
  { name: 'Federation University', shortName: 'FedUni', campus: 'Berwick', lat: -38.0320, lng: 145.3490, url: 'https://www.federation.edu.au', color: '#FF6900' },
  { name: 'Federation University', shortName: 'FedUni', campus: 'Ballarat Mt Helen', lat: -37.5607, lng: 143.8597, url: 'https://www.federation.edu.au/campuses/ballarat', color: '#FF6900' },
  { name: 'La Trobe University', shortName: 'La Trobe', campus: 'Bendigo', lat: -36.7523, lng: 144.2775, url: 'https://www.latrobe.edu.au/campuses/bendigo', color: '#BE2BBB' },
]

function getLibraryOpenStatus(hoursJson: string | null): { todayHours: string | null; isOpen: boolean } | null {
  if (!hoursJson) return null
  try {
    const hours = JSON.parse(hoursJson) as Record<string, string | null>
    const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
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

export default function HomePage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const markersRef = useRef<unknown[]>([])
  const uniMarkersRef = useRef<unknown[]>([])
  const geojsonRef = useRef<{ features: { properties: { lga_slug: string }; geometry: { type: string; coordinates: unknown[] } }[] } | null>(null)
  const [geojsonReady, setGeojsonReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [councils, setCouncils] = useState<Council[]>([])
  const [hoveredCouncil, setHoveredCouncil] = useState<Council | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [showLibraries, setShowLibraries] = useState(false)
  const [libraries, setLibraries] = useState<LibraryPin[]>([])
  const [librariesLoaded, setLibrariesLoaded] = useState(false)
  const [showUniversities, setShowUniversities] = useState(false)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [legendOpen, setLegendOpen] = useState(false)

  useEffect(() => {
    fetch('/api/councils').then(r => r.json()).then(setCouncils)
  }, [])

  const toggleLibraries = useCallback(async () => {
    if (!showLibraries && !librariesLoaded) {
      const data = await fetch('/api/libraries?map=true').then(r => r.json())
      setLibraries(data)
      setLibrariesLoaded(true)
    }
    setShowLibraries(prev => !prev)
  }, [showLibraries, librariesLoaded])

  // Update fill opacity when activeRegion changes
  useEffect(() => {
    if (!mapRef.current) return
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      const map = mapRef.current as mapboxgl.Map
      if (!map.getLayer('lga-fill')) return
      if (!activeRegion) {
        map.setPaintProperty('lga-fill', 'fill-opacity', 0.5)
        return
      }
      const regionSlugs = councils.filter(c => c.region === activeRegion).map(c => c.id)
      const opacityExpr: unknown[] = ['match', ['get', 'lga_slug'], ...regionSlugs.flatMap(s => [s, 0.75]), 0.15]
      map.setPaintProperty('lga-fill', 'fill-opacity', opacityExpr as mapboxgl.Expression)
    })
  }, [activeRegion, councils])

  const flyToRegion = useCallback((region: string) => {
    const next = activeRegion === region ? null : region
    setActiveRegion(next)
    if (!next || !mapRef.current || !geojsonRef.current) return

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      const map = mapRef.current as mapboxgl.Map
      const regionSlugs = new Set(councils.filter(c => c.region === next).map(c => c.id))
      const features = geojsonRef.current!.features.filter(f => regionSlugs.has(f.properties.lga_slug))
      if (features.length === 0) return

      // Compute bounding box from all polygon coordinates
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
      function scanCoords(coords: unknown[]) {
        if (typeof coords[0] === 'number') {
          const [lng, lat] = coords as number[]
          if (lng < minLng) minLng = lng
          if (lng > maxLng) maxLng = lng
          if (lat < minLat) minLat = lat
          if (lat > maxLat) maxLat = lat
        } else {
          for (const c of coords) scanCoords(c as unknown[])
        }
      }
      for (const f of features) scanCoords(f.geometry.coordinates)
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 40, duration: 800 })
    })
  }, [activeRegion, councils])

  const flyToCouncil = useCallback((slug: string) => {
    if (!mapRef.current || !geojsonRef.current) return
    const feature = geojsonRef.current.features.find(f => f.properties.lga_slug === slug)
    if (!feature) return
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      const map = mapRef.current as mapboxgl.Map
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
      function scanCoords(coords: unknown[]) {
        if (typeof coords[0] === 'number') {
          const [lng, lat] = coords as number[]
          if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng
          if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat
        } else { for (const c of coords) scanCoords(c as unknown[]) }
      }
      scanCoords(feature.geometry.coordinates)
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, duration: 800 })
    })
  }, [])

  // Auto-fly when arriving via "View on map" link (waits for geojson to load)
  const highlightSlug = searchParams.get('council')
  useEffect(() => {
    if (!highlightSlug || !geojsonReady) return
    flyToCouncil(highlightSlug)
  }, [highlightSlug, geojsonReady, flyToCouncil])

  // Add/remove university markers when toggle changes
  useEffect(() => {
    if (!mapRef.current) return
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      for (const m of uniMarkersRef.current) (m as mapboxgl.Marker).remove()
      uniMarkersRef.current = []
      if (!showUniversities) return

      for (const uni of UNIVERSITIES) {
        const popup = new mapboxgl.Popup({ offset: 14, maxWidth: '280px', closeButton: false }).setHTML(`
          <div style="font-family:sans-serif;padding:4px 2px">
            <a href="${uni.url}" target="_blank" rel="noopener noreferrer"
               style="font-size:15px;font-weight:700;color:${uni.color};text-decoration:underline;display:block;line-height:1.4;cursor:pointer">
              ${uni.name} — ${uni.campus} ↗
            </a>
          </div>
        `)

        const el = document.createElement('div')
        el.innerHTML = '🎓'
        el.style.cssText = 'font-size:22px;cursor:pointer;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5));line-height:1'
        el.addEventListener('mouseenter', () => setHoveredCouncil(null))

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([uni.lng, uni.lat])
          .setPopup(popup)
          .addTo(mapRef.current as mapboxgl.Map)

        // Stop propagation so click doesn't bubble to council layer
        // Close all other uni popups before opening this one
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          const isOpen = marker.getPopup()?.isOpen() ?? false
          uniMarkersRef.current.forEach(m => (m as mapboxgl.Marker).getPopup()?.remove())
          if (!isOpen) marker.togglePopup()
        })

        uniMarkersRef.current.push(marker)
      }
    })
  }, [showUniversities])

  // Add/remove library markers when toggle changes
  useEffect(() => {
    if (!mapRef.current) return
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      // Remove existing markers
      for (const m of markersRef.current) {
        (m as mapboxgl.Marker).remove()
      }
      markersRef.current = []

      if (!showLibraries) return

      for (const lib of libraries) {
        const popup = new mapboxgl.Popup({ offset: 12, maxWidth: '260px' }).setHTML(`
          <div style="font-family:sans-serif;font-size:13px;line-height:1.5">
            <strong style="font-size:14px">${lib.name}</strong><br/>
            ${lib.address ? `<span style="color:#666">${lib.address}${lib.suburb ? ', ' + lib.suburb : ''}</span><br/>` : ''}
            ${(() => {
              const s = getLibraryOpenStatus(lib.hoursJson)
              if (!s) return ''
              return `<span style="color:${s.isOpen ? '#16a34a' : '#dc2626'}">${s.isOpen ? '🟢 Open now' : '🔴 Closed'}</span>${s.todayHours ? ` · ${s.todayHours}` : ''}<br/>`
            })()}
            ${lib.url ? `<a href="${lib.url}" target="_blank" style="color:#7c3aed">More info →</a>` : ''}
          </div>
        `)

        const el = document.createElement('div')
        el.innerHTML = '📚'
        el.style.cssText = 'font-size:20px;cursor:pointer;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));line-height:1'

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lib.lng, lib.lat])
          .setPopup(popup)
          .addTo(mapRef.current as mapboxgl.Map)

        markersRef.current.push(marker)
      }
    })
  }, [showLibraries, libraries])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || councils.length === 0) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.warn('NEXT_PUBLIC_MAPBOX_TOKEN not set — map disabled')
      return
    }

    // Dynamic import to avoid SSR issues
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      import('mapbox-gl/dist/mapbox-gl.css')
      mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [145.5, -36.8],
        zoom: 7,
      })
      mapRef.current = map

      map.on('load', async () => {
        // Load GeoJSON
        let geojson
        try {
          const res = await fetch('/melbourne-lgas.geojson')
          if (!res.ok) {
            console.warn('GeoJSON not found at /melbourne-lgas.geojson — map boundaries disabled')
            return
          }
          geojson = await res.json()
        } catch {
          console.warn('Failed to load GeoJSON')
          return
        }

        geojsonRef.current = geojson
        setGeojsonReady(true)
        map.addSource('lgas', { type: 'geojson', data: geojson })

        // Build color expression
        const slugToRegion = Object.fromEntries(councils.map(c => [c.id, c.region]))
        const colorExpression: unknown[] = ['match', ['get', 'lga_slug']]
        for (const [slug, region] of Object.entries(slugToRegion)) {
          colorExpression.push(slug, REGION_COLORS[region] ?? '#e5e7eb')
        }
        colorExpression.push('#e5e7eb') // fallback

        map.addLayer({
          id: 'lga-fill',
          type: 'fill',
          source: 'lgas',
          paint: {
            'fill-color': colorExpression as mapboxgl.Expression,
            'fill-opacity': 0.5,
          },
        })

        map.addLayer({
          id: 'lga-border',
          type: 'line',
          source: 'lgas',
          paint: { 'line-color': '#ffffff', 'line-width': 1 },
        })

        map.on('click', 'lga-fill', (e) => {
          const slug = e.features?.[0]?.properties?.lga_slug as string | undefined
          if (slug) router.push(`/councils/${slug}`)
        })

        map.on('mousemove', 'lga-fill', (e) => {
          map.getCanvas().style.cursor = 'pointer'
          const slug = e.features?.[0]?.properties?.lga_slug as string | undefined
          const council = councils.find(c => c.id === slug)
          setHoveredCouncil(council ?? null)
          setTooltipPos({ x: e.point.x, y: e.point.y })
        })

        map.on('mouseleave', 'lga-fill', () => {
          map.getCanvas().style.cursor = ''
          setHoveredCouncil(null)
        })
      })

      return () => map.remove()
    })
  }, [councils, router])

  return (
    <div className="relative h-[calc(100vh-56px)]">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Hover tooltip */}
      {hoveredCouncil && (
        <div
          className="absolute bg-white rounded-lg shadow-lg p-3 pointer-events-none translate-x-3 -translate-y-full"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <p className="font-semibold text-sm">{hoveredCouncil.name}</p>
          {hoveredCouncil.population && (
            <p className="text-xs text-gray-500">Pop: {hoveredCouncil.population.toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Search box */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-64 sm:w-80">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search council…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 rounded-xl shadow-lg text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-(--color-primary)/40"
          />
          {searchQuery && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-56 overflow-y-auto z-20">
              {councils
                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 8)
                .map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left"
                    onClick={() => { flyToCouncil(c.id); setSearchQuery('') }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: REGION_COLORS[c.region] ?? '#e5e7eb' }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              {councils.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-400">No councils found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={toggleLibraries}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            showLibraries
              ? 'bg-purple-600 text-white shadow-purple-200'
              : 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400 animate-bounce'
          }`}
        >
          <span>📚</span>
          <span>{showLibraries ? `Hide libraries (${libraries.length})` : 'Click to show libraries'}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowUniversities(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            showUniversities
              ? 'bg-indigo-600 text-white shadow-indigo-200'
              : 'bg-white text-indigo-700 border-2 border-indigo-200 hover:border-indigo-400 animate-bounce'
          }`}
        >
          <span>🎓</span>
          <span>{showUniversities ? `Hide universities (${UNIVERSITIES.length})` : 'Click to show universities'}</span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <button
          type="button"
          onClick={() => setLegendOpen(v => !v)}
          className="flex items-center justify-between w-full gap-4 sm:cursor-default"
        >
          <p className="font-semibold text-gray-700">Regions</p>
          <span className="sm:hidden text-gray-400">{legendOpen ? '▲' : '▼'}</span>
        </button>
        <div className={`${legendOpen ? 'block' : 'hidden'} sm:block mt-2`}>
        {Object.entries(REGION_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => flyToRegion(key)}
            className={`flex items-center gap-2 mb-1 w-full rounded px-1 py-0.5 transition-colors cursor-pointer hover:bg-gray-50 ${
              activeRegion === key ? 'ring-1 ring-gray-400 bg-gray-50' : ''
            }`}
          >
            <div
              className="w-3 h-3 rounded-sm shrink-0 transition-transform"
              style={{
                backgroundColor: REGION_COLORS[key],
                transform: activeRegion === key ? 'scale(1.3)' : 'scale(1)',
              }}
            />
            <span className={activeRegion === key ? 'font-semibold text-gray-800' : 'text-gray-600'}>{label}</span>
          </button>
        ))}
        {activeRegion && (
          <button
            type="button"
            onClick={() => setActiveRegion(null)}
            className="mt-1 w-full text-center text-gray-400 hover:text-gray-600 text-[10px]"
          >
            Show all
          </button>
        )}
        </div>
      </div>

      {/* Fallback when no token */}
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Map requires NEXT_PUBLIC_MAPBOX_TOKEN</p>
            <a href="/councils" className="text-(--color-primary) underline">Browse councils →</a>
          </div>
        </div>
      )}
    </div>
  )
}
