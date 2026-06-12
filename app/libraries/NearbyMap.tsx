'use client'
import { useEffect, useRef } from 'react'

interface LibraryPin {
  id: string
  name: string
  address: string | null
  suburb: string | null
  url: string | null
  lat: number | null
  lng: number | null
  distance: number
}

interface Props {
  libraries: LibraryPin[]
  centerLng: number
  centerLat: number
}

export function NearbyMap({ libraries, centerLng, centerLat }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Destroy previous map instance when results change
    if (mapRef.current) {
      ;(mapRef.current as { remove: () => void }).remove()
      mapRef.current = null
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      import('mapbox-gl/dist/mapbox-gl.css')
      mapboxgl.accessToken = token

      // Fit bounds to include all pins
      const allLngs = [centerLng, ...libraries.filter(l => l.lng).map(l => l.lng!)]
      const allLats = [centerLat, ...libraries.filter(l => l.lat).map(l => l.lat!)]
      const minLng = Math.min(...allLngs)
      const maxLng = Math.max(...allLngs)
      const minLat = Math.min(...allLats)
      const maxLat = Math.max(...allLats)

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 11,
      })
      mapRef.current = map

      map.on('load', () => {
        // Fit all pins in view
        map.fitBounds(
          [[minLng - 0.01, minLat - 0.01], [maxLng + 0.01, maxLat + 0.01]],
          { padding: 48, maxZoom: 14, duration: 600 }
        )

        // User location marker
        const userEl = document.createElement('div')
        userEl.innerHTML = '📍'
        userEl.style.cssText = 'font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))'
        new mapboxgl.Marker({ element: userEl })
          .setLngLat([centerLng, centerLat])
          .setPopup(new mapboxgl.Popup({ offset: 14, closeButton: false }).setHTML(
            `<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#7c3aed">Your location</div>`
          ))
          .addTo(map)

        // Library markers
        libraries.forEach((lib, i) => {
          if (!lib.lat || !lib.lng) return

          const el = document.createElement('div')
          el.style.cssText = `
            width:28px;height:28px;border-radius:50%;
            background:#7c3aed;color:white;
            display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:700;
            box-shadow:0 2px 6px rgba(0,0,0,.35);
            cursor:pointer;border:2px solid white;
          `
          el.textContent = String(i + 1)

          const distText = lib.distance < 1
            ? `${Math.round(lib.distance * 1000)}m away`
            : `${lib.distance.toFixed(1)}km away`

          const popup = new mapboxgl.Popup({ offset: 14, maxWidth: '240px', closeButton: false })
            .setHTML(`
              <div style="font-family:sans-serif;padding:2px 0">
                <div style="font-weight:700;font-size:14px;color:#1f2937;margin-bottom:2px">${lib.name}</div>
                ${lib.address ? `<div style="font-size:12px;color:#6b7280">${lib.address}${lib.suburb ? ', ' + lib.suburb : ''}</div>` : ''}
                <div style="font-size:12px;color:#7c3aed;font-weight:600;margin-top:4px">${distText}</div>
                ${lib.url ? `<a href="${lib.url}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#7c3aed;text-decoration:underline;display:block;margin-top:4px">More info →</a>` : ''}
              </div>
            `)

          new mapboxgl.Marker({ element: el })
            .setLngLat([lib.lng, lib.lat])
            .setPopup(popup)
            .addTo(map)
        })
      })
    })

    return () => {
      if (mapRef.current) {
        ;(mapRef.current as { remove: () => void }).remove()
        mapRef.current = null
      }
    }
  }, [libraries, centerLng, centerLat])

  return (
    <div className="mt-5 rounded-2xl overflow-hidden border border-purple-100 shadow-sm">
      <div ref={mapContainer} className="w-full h-80 md:h-96" />
      <div className="bg-purple-50 px-4 py-2 flex items-center gap-2 text-xs text-purple-600">
        <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
        numbered pins = libraries by distance &nbsp;·&nbsp;
        <span>📍</span> = your searched location
      </div>
    </div>
  )
}
