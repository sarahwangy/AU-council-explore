'use client'
import { useEffect, useRef } from 'react'

interface ZoneFeatureCollection {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    geometry: unknown
    properties: { School_Name: string; zoneType: 'primary' | 'secondary' }
  }[]
}

interface Props {
  centerLng: number
  centerLat: number
  zones: ZoneFeatureCollection
}

export function SchoolZoneMap({ centerLng, centerLat, zones }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) {
      ;(mapRef.current as { remove: () => void }).remove()
      mapRef.current = null
    }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      import('mapbox-gl/dist/mapbox-gl.css')
      mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 13,
      })
      mapRef.current = map

      map.on('load', () => {
        // Add zone polygons
        map.addSource('school-zones', { type: 'geojson', data: zones as Parameters<typeof map.addSource>[1] extends { data: infer D } ? D : never })

        map.addLayer({
          id: 'zones-fill-primary',
          type: 'fill',
          source: 'school-zones',
          filter: ['==', ['get', 'zoneType'], 'primary'],
          paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 },
        })
        map.addLayer({
          id: 'zones-fill-secondary',
          type: 'fill',
          source: 'school-zones',
          filter: ['==', ['get', 'zoneType'], 'secondary'],
          paint: { 'fill-color': '#10b981', 'fill-opacity': 0.15 },
        })
        map.addLayer({
          id: 'zones-outline-primary',
          type: 'line',
          source: 'school-zones',
          filter: ['==', ['get', 'zoneType'], 'primary'],
          paint: { 'line-color': '#2563eb', 'line-width': 2 },
        })
        map.addLayer({
          id: 'zones-outline-secondary',
          type: 'line',
          source: 'school-zones',
          filter: ['==', ['get', 'zoneType'], 'secondary'],
          paint: { 'line-color': '#059669', 'line-width': 2 },
        })

        // Popup on zone click
        for (const layerId of ['zones-fill-primary', 'zones-fill-secondary'] as const) {
          map.on('click', layerId, (e) => {
            const props = e.features?.[0]?.properties as { School_Name: string; zoneType: string } | undefined
            if (!props) return
            const color = props.zoneType === 'primary' ? '#2563eb' : '#059669'
            const label = props.zoneType === 'primary' ? '🎒 Primary' : '🎓 Secondary'
            new mapboxgl.Popup({ closeButton: false, maxWidth: '220px' })
              .setLngLat(e.lngLat)
              .setHTML(`<div style="font-family:sans-serif;padding:2px 0">
                <div style="font-size:11px;color:${color};font-weight:600;margin-bottom:2px">${label} Zone</div>
                <div style="font-weight:700;font-size:13px;color:#1f2937">${props.School_Name}</div>
              </div>`)
              .addTo(map)
          })
          map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = '' })
        }

        // Fit map to zones if any exist
        if (zones.features.length > 0) {
          const allCoords: [number, number][] = []
          for (const f of zones.features) {
            const geom = f.geometry as { type: string; coordinates: unknown }
            if (geom.type === 'Polygon') {
              for (const c of (geom.coordinates as number[][][])[0]) allCoords.push([c[0], c[1]])
            } else if (geom.type === 'MultiPolygon') {
              for (const poly of geom.coordinates as number[][][][]) {
                for (const c of poly[0]) allCoords.push([c[0], c[1]])
              }
            }
          }
          if (allCoords.length > 0) {
            const lngs = allCoords.map(c => c[0])
            const lats = allCoords.map(c => c[1])
            map.fitBounds(
              [[Math.min(...lngs) - 0.005, Math.min(...lats) - 0.005], [Math.max(...lngs) + 0.005, Math.max(...lats) + 0.005]],
              { padding: 48, maxZoom: 14, duration: 600 }
            )
          }
        }

        // Searched address pin
        const el = document.createElement('div')
        el.innerHTML = '📍'
        el.style.cssText = 'font-size:30px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))'
        new mapboxgl.Marker({ element: el })
          .setLngLat([centerLng, centerLat])
          .setPopup(new mapboxgl.Popup({ offset: 14, closeButton: false })
            .setHTML('<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#1d4ed8">Your address</div>'))
          .addTo(map)
      })
    })

    return () => {
      if (mapRef.current) {
        ;(mapRef.current as { remove: () => void }).remove()
        mapRef.current = null
      }
    }
  }, [centerLng, centerLat, zones])

  return (
    <div className="mt-5 rounded-2xl overflow-hidden border border-blue-100 shadow-sm">
      <div ref={mapContainer} className="w-full h-80 md:h-96" />
      <div className="bg-blue-50 px-4 py-2 flex items-center gap-4 text-xs text-blue-600 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-8 h-2 rounded bg-blue-400 opacity-70" /> Primary zone
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-8 h-2 rounded bg-emerald-400 opacity-70" /> Secondary zone
        </span>
        <span className="flex items-center gap-1">📍 Your address</span>
        <span className="text-blue-400">· Click zone to see school name</span>
      </div>
    </div>
  )
}
