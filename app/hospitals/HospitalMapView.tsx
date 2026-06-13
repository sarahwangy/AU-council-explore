'use client'
import { useEffect, useRef } from 'react'

interface Props {
  centerLat: number
  centerLng: number
  items: { id: string; name: string; lat: number; lng: number; emergency: boolean }[]
}

export default function HospitalMapView({ centerLat, centerLng, items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

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
        const popup = new mapboxgl.Popup({ offset: 10, closeButton: false, maxWidth: '200px' })
          .setHTML(`<div style="font-family:sans-serif">
            <div style="font-weight:700;font-size:13px;color:#1f2937">${item.name}</div>
            ${item.emergency ? '<div style="font-size:11px;color:#dc2626;font-weight:600;margin-top:2px">🚨 Emergency</div>' : ''}
          </div>`)
        new mapboxgl.Marker({ element: dot }).setLngLat([item.lng, item.lat]).setPopup(popup).addTo(map)
      }
    })

    return () => {
      if (mapRef.current) { (mapRef.current as { remove: () => void }).remove(); mapRef.current = null }
    }
  }, [centerLat, centerLng, items])

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
