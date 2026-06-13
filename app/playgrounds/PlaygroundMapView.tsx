'use client'
import { useEffect, useRef } from 'react'

interface Props {
  centerLat: number
  centerLng: number
  items: { id: string; name: string; lat: number; lng: number }[]
}

export default function PlaygroundMapView({ centerLat, centerLng, items }: Props) {
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
        const popup = new mapboxgl.Popup({ offset: 10, closeButton: false, maxWidth: '180px' })
          .setHTML(`<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#1f2937">${item.name}</div>`)
        new mapboxgl.Marker({ element: dot }).setLngLat([item.lng, item.lat]).setPopup(popup).addTo(map)
      }
    })

    return () => {
      if (mapRef.current) { (mapRef.current as { remove: () => void }).remove(); mapRef.current = null }
    }
  }, [centerLat, centerLng, items])

  return <div ref={containerRef} className="w-full h-full" />
}
