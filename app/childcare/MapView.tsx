'use client'
import { useEffect, useRef } from 'react'

interface Item {
  id: string
  name: string
  lat: number
  lng: number
  type: string
  rating: string
}

interface Props {
  centerLat: number
  centerLng: number
  selectedId?: string | null
  items: Item[]
}

const RATING_COLOR: Record<string, string> = {
  'Exceeding NQS': '#059669',
  'Meeting NQS': '#2563eb',
  'Working Towards NQS': '#d97706',
  'Significant Improvement Required': '#dc2626',
}

export default function MapView({ centerLat, centerLng, selectedId, items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const popupsRef = useRef<Map<string, { popup: unknown; lat: number; lng: number }>>(new Map())

  useEffect(() => {
    if (!containerRef.current) return
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
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 13,
      })
      mapRef.current = map

      // 📍 search centre marker
      const el = document.createElement('div')
      el.innerHTML = '📍'
      el.style.cssText = 'font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))'
      new mapboxgl.Marker({ element: el }).setLngLat([centerLng, centerLat]).addTo(map)

      // childcare markers
      for (const item of items) {
        const color = RATING_COLOR[item.rating] ?? '#7c3aed'
        const dot = document.createElement('div')
        dot.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer`
        const popup = new mapboxgl.Popup({ offset: 14, closeButton: false, maxWidth: '220px' })
          .setHTML(`<div style="font-family:sans-serif;padding:2px 0">
            <div style="font-weight:700;font-size:13px;color:#1f2937;margin-bottom:2px">${item.name}</div>
            <div style="font-size:11px;color:#6b7280">${item.type}</div>
            ${item.rating ? `<div style="font-size:11px;color:${color};font-weight:600;margin-top:2px">⭐ ${item.rating}</div>` : ''}
          </div>`)
        new mapboxgl.Marker({ element: dot }).setLngLat([item.lng, item.lat]).addTo(map)
        popupsRef.current.set(item.id, { popup, lat: item.lat, lng: item.lng })
        dot.addEventListener('mouseenter', () => popup.setLngLat([item.lng, item.lat]).addTo(map))
        dot.addEventListener('mouseleave', () => popup.remove())
      }
    })

    return () => {
      if (mapRef.current) {
        ;(mapRef.current as { remove: () => void }).remove()
        mapRef.current = null
      }
    }
  }, [centerLat, centerLng, items])

  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const entry = popupsRef.current.get(selectedId)
    if (!entry) return
    const map = mapRef.current as { flyTo: (opts: unknown) => void }
    const { popup, lat, lng } = entry as { popup: { setLngLat: (c: [number, number]) => unknown; addTo: (m: unknown) => void; remove: () => void }; lat: number; lng: number }
    popupsRef.current.forEach(e => (e as typeof entry & { popup: { remove: () => void } }).popup.remove())
    map.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 })
    setTimeout(() => popup.setLngLat([lng, lat]).addTo(mapRef.current), 600)
  }, [selectedId])

  return <div ref={containerRef} className="w-full h-full" />
}
