'use client'
import { useEffect, useRef } from 'react'

interface Props {
  centerLat: number
  centerLng: number
  selectedId?: string | null
  items: { id: string; name: string; lat: number; lng: number }[]
}

export default function PlaygroundMapView({ centerLat, centerLng, selectedId, items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const popupsRef = useRef<Map<string, { popup: unknown; lat: number; lng: number }>>(new Map())

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) { (mapRef.current as { remove: () => void }).remove(); mapRef.current = null }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      import('mapbox-gl/dist/mapbox-gl.css')
      mapboxgl.accessToken = token
      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 14,
      })
      mapRef.current = map

      const pinEl = document.createElement('div')
      pinEl.innerHTML = '📍'
      pinEl.style.cssText = 'font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))'
      new mapboxgl.Marker({ element: pinEl }).setLngLat([centerLng, centerLat]).addTo(map)

      for (const item of items) {
        const dot = document.createElement('div')
        dot.innerHTML = '🛝'
        dot.style.cssText = 'font-size:20px;line-height:1;cursor:pointer'
        const popup = new mapboxgl.Popup({ offset: 14, closeButton: false, maxWidth: '200px' })
          .setHTML(`<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#1f2937;padding:2px 0">${item.name}</div>`)
        new mapboxgl.Marker({ element: dot }).setLngLat([item.lng, item.lat]).addTo(map)
        popupsRef.current.set(item.id, { popup, lat: item.lat, lng: item.lng })
        dot.addEventListener('mouseenter', () => popup.setLngLat([item.lng, item.lat]).addTo(map))
        dot.addEventListener('mouseleave', () => popup.remove())
      }
    })

    return () => {
      if (mapRef.current) { (mapRef.current as { remove: () => void }).remove(); mapRef.current = null }
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
