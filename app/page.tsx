'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const REGION_COLORS: Record<string, string> = {
  inner: '#7c3aed',
  eastern: '#2563eb',
  southern: '#16a34a',
  northern: '#ea580c',
  western: '#dc2626',
  outer: '#6b7280',
}

const REGION_LABELS: Record<string, string> = {
  inner: 'Inner', eastern: 'Eastern', southern: 'Southern',
  northern: 'Northern', western: 'Western', outer: 'Outer',
}

interface Council {
  id: string
  name: string
  region: string
  population?: number | null
  _count?: { events: number }
}

export default function HomePage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const router = useRouter()
  const [councils, setCouncils] = useState<Council[]>([])
  const [hoveredCouncil, setHoveredCouncil] = useState<Council | null>(null)

  useEffect(() => {
    fetch('/api/councils').then(r => r.json()).then(setCouncils)
  }, [])

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
        style: 'mapbox://styles/mapbox/light-v11',
        center: [145.0, -37.8],
        zoom: 9,
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
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 pointer-events-none">
          <p className="font-semibold text-sm">{hoveredCouncil.name}</p>
          {hoveredCouncil.population && (
            <p className="text-xs text-gray-500">Pop: {hoveredCouncil.population.toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 right-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold mb-2 text-gray-700">Regions</p>
        {Object.entries(REGION_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm" data-region={key} style={{ backgroundColor: REGION_COLORS[key] }} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
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
