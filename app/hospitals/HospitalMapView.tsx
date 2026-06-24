'use client'
import { useEffect, useRef } from 'react'

interface Props {
  centerLat: number
  centerLng: number
  selectedId?: string | null
  items: { id: string; name: string; lat: number; lng: number; emergency: boolean }[]
}

export default function HospitalMapView({ centerLat, centerLng, selectedId, items }: Props) {
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
        zoom: 13,
      })
      mapRef.current = map

      const pinEl = document.createElement('div')
      pinEl.innerHTML = '📍'
      pinEl.style.cssText = 'font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))'
      new mapboxgl.Marker({ element: pinEl }).setLngLat([centerLng, centerLat]).addTo(map)

      for (const item of items) {
        const dot = document.createElement('div')
        dot.style.cssText = `width:14px;height:14px;border-radius:50%;background:${item.emergency ? '#dc2626' : '#2563eb'};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer`
        const popup = new mapboxgl.Popup({ offset: 14, closeButton: false, maxWidth: '200px' })
          .setHTML(`<div style="font-family:sans-serif;padding:2px 0">
            <div style="font-weight:700;font-size:13px;color:#1f2937">${item.name}</div>
            ${item.emergency ? '<div style="font-size:11px;color:#dc2626;font-weight:600;margin-top:2px">🚨 Emergency</div>' : ''}
          </div>`)
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
    const { popup, lat, lng } = entry as { popup: { setLngLat: (c: [number, number]) => { addTo: (m: unknown) => void; remove: () => void }; addTo: (m: unknown) => void; remove: () => void }; lat: number; lng: number }
    popupsRef.current.forEach(e => (e as typeof entry & { popup: { remove: () => void } }).popup.remove())
    map.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 })
    setTimeout(() => popup.setLngLat([lng, lat]).addTo(mapRef.current as unknown), 600)
  }, [selectedId])

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg px-2 py-1.5 text-xs flex gap-3 shadow">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Emergency</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Other</span>
      </div>
    </div>
  )
}
