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

const STATE_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  VIC: [[140.96, -39.20], [149.98, -33.98]],
  NSW: [[140.99, -37.51], [153.64, -28.16]],
  QLD: [[137.99, -29.18], [153.55, -10.68]],
  SA:  [[128.99, -38.07], [141.00, -25.99]],
  WA:  [[112.92, -35.14], [129.00, -13.69]],
  TAS: [[143.83, -43.65], [148.48, -39.57]],
  ACT: [[148.76, -35.92], [149.40, -35.12]],
  NT:  [[129.00, -26.00], [138.00, -10.97]],
}

const NSW_REGION_COLORS: Record<string, string> = {
  'sydney-inner':     '#7c3aed',
  'sydney-north':     '#2563eb',
  'sydney-west':      '#ea580c',
  'sydney-southwest': '#16a34a',
  'nsw-regional':     '#0891b2',
}
const NSW_REGION_LABELS: Record<string, string> = {
  'sydney-inner':     'Inner Sydney',
  'sydney-north':     'North Sydney',
  'sydney-west':      'Western Sydney',
  'sydney-southwest': 'South-West Sydney',
  'nsw-regional':     'NSW Regional',
}

const QLD_REGION_COLORS: Record<string, string> = {
  'brisbane-north':  '#7c3aed',
  'brisbane-south':  '#2563eb',
  'gold-coast':      '#ea580c',
  'sunshine-coast':  '#16a34a',
  'qld-regional':    '#0891b2',
}
const QLD_REGION_LABELS: Record<string, string> = {
  'brisbane-north':  'Brisbane North',
  'brisbane-south':  'Brisbane South',
  'gold-coast':      'Gold Coast',
  'sunshine-coast':  'Sunshine Coast',
  'qld-regional':    'QLD Regional',
}

const SA_REGION_COLORS: Record<string, string> = {
  'adelaide-metro':  '#7c3aed',
  'adelaide-hills':  '#16a34a',
  'sa-regional':     '#0891b2',
}
const SA_REGION_LABELS: Record<string, string> = {
  'adelaide-metro':  'Adelaide Metro',
  'adelaide-hills':  'Adelaide Hills & South',
  'sa-regional':     'SA Regional',
}

const WA_REGION_COLORS: Record<string, string> = {
  'perth-metro':  '#7c3aed',
  'perth-south':  '#2563eb',
  'wa-regional':  '#0891b2',
}
const WA_REGION_LABELS: Record<string, string> = {
  'perth-metro':  'Perth Metro',
  'perth-south':  'Perth South',
  'wa-regional':  'WA Regional',
}

const TAS_REGION_COLORS: Record<string, string> = {
  'hobart-metro':  '#7c3aed',
  'launceston':    '#2563eb',
  'tas-regional':  '#0891b2',
}
const TAS_REGION_LABELS: Record<string, string> = {
  'hobart-metro':  'Hobart Metro',
  'launceston':    'Launceston',
  'tas-regional':  'TAS Regional',
}

const NT_REGION_COLORS: Record<string, string> = {
  'darwin-metro':  '#7c3aed',
  'alice-springs': '#ea580c',
  'nt-regional':   '#0891b2',
}
const NT_REGION_LABELS: Record<string, string> = {
  'darwin-metro':  'Darwin Metro',
  'alice-springs': 'Alice Springs',
  'nt-regional':   'NT Regional',
}

const STATE_REGION_COLORS: Record<string, Record<string, string>> = {
  VIC: {}, // uses REGION_COLORS keyed by lga_slug
  NSW: NSW_REGION_COLORS,
  QLD: QLD_REGION_COLORS,
  SA:  SA_REGION_COLORS,
  WA:  WA_REGION_COLORS,
  TAS: TAS_REGION_COLORS,
  NT:  NT_REGION_COLORS,
}
const STATE_REGION_LABELS: Record<string, Record<string, string>> = {
  VIC: {}, NSW: NSW_REGION_LABELS, QLD: QLD_REGION_LABELS, SA: SA_REGION_LABELS,
  WA: WA_REGION_LABELS, TAS: TAS_REGION_LABELS, NT: NT_REGION_LABELS,
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

const UNIVERSITIES_BY_STATE: Record<string, UniversityPin[]> = {
  VIC: [
    { name: 'University of Melbourne', shortName: 'UniMelb', campus: 'Parkville', lat: -37.7963, lng: 144.9614, url: 'https://www.unimelb.edu.au', color: '#003087' },
    { name: 'Monash University', shortName: 'Monash', campus: 'Clayton', lat: -37.9105, lng: 145.1362, url: 'https://www.monash.edu', color: '#006CAB' },
    { name: 'Monash University', shortName: 'Monash', campus: 'Caulfield', lat: -37.8783, lng: 145.0432, url: 'https://www.monash.edu/campuses/caulfield', color: '#006CAB' },
    { name: 'RMIT University', shortName: 'RMIT', campus: 'City', lat: -37.8080, lng: 144.9622, url: 'https://www.rmit.edu.au', color: '#E61E2A' },
    { name: 'RMIT University', shortName: 'RMIT', campus: 'Bundoora', lat: -37.7072, lng: 145.0495, url: 'https://www.rmit.edu.au/about/our-locations/bundoora', color: '#E61E2A' },
    { name: 'Deakin University', shortName: 'Deakin', campus: 'Burwood', lat: -37.8469, lng: 145.1153, url: 'https://www.deakin.edu.au/burwood', color: '#00A94F' },
    { name: 'Deakin University', shortName: 'Deakin', campus: 'Geelong Waurn Ponds', lat: -38.1951, lng: 144.2965, url: 'https://www.deakin.edu.au/geelong', color: '#00A94F' },
    { name: 'La Trobe University', shortName: 'La Trobe', campus: 'Bundoora', lat: -37.7215, lng: 145.0481, url: 'https://www.latrobe.edu.au', color: '#BE2BBB' },
    { name: 'Swinburne University', shortName: 'Swinburne', campus: 'Hawthorn', lat: -37.8225, lng: 145.0378, url: 'https://www.swinburne.edu.au', color: '#C41230' },
    { name: 'Victoria University', shortName: 'VU', campus: 'Footscray', lat: -37.7993, lng: 144.8996, url: 'https://www.vu.edu.au', color: '#00427A' },
    { name: 'Australian Catholic University', shortName: 'ACU', campus: 'Melbourne', lat: -37.8058, lng: 144.9626, url: 'https://www.acu.edu.au', color: '#1B3A6B' },
    { name: 'Federation University', shortName: 'FedUni', campus: 'Ballarat Mt Helen', lat: -37.5607, lng: 143.8597, url: 'https://www.federation.edu.au/campuses/ballarat', color: '#FF6900' },
    { name: 'La Trobe University', shortName: 'La Trobe', campus: 'Bendigo', lat: -36.7523, lng: 144.2775, url: 'https://www.latrobe.edu.au/campuses/bendigo', color: '#BE2BBB' },
  ],
  NSW: [
    { name: 'University of Sydney', shortName: 'USYD', campus: 'Camperdown', lat: -33.8882, lng: 151.1873, url: 'https://www.sydney.edu.au', color: '#003087' },
    { name: 'University of New South Wales', shortName: 'UNSW', campus: 'Kensington', lat: -33.9173, lng: 151.2313, url: 'https://www.unsw.edu.au', color: '#FFD100' },
    { name: 'Macquarie University', shortName: 'MQ', campus: 'North Ryde', lat: -33.7738, lng: 151.1126, url: 'https://www.mq.edu.au', color: '#D0021B' },
    { name: 'University of Technology Sydney', shortName: 'UTS', campus: 'Ultimo', lat: -33.8834, lng: 151.2002, url: 'https://www.uts.edu.au', color: '#00A3E0' },
    { name: 'Western Sydney University', shortName: 'WSU', campus: 'Parramatta', lat: -33.8136, lng: 150.9939, url: 'https://www.westernsydney.edu.au', color: '#E4002B' },
    { name: 'University of Newcastle', shortName: 'UoN', campus: 'Callaghan', lat: -32.8942, lng: 151.7089, url: 'https://www.newcastle.edu.au', color: '#004B87' },
    { name: 'University of Wollongong', shortName: 'UOW', campus: 'Wollongong', lat: -34.4059, lng: 150.8785, url: 'https://www.uow.edu.au', color: '#003057' },
    { name: 'Australian Catholic University', shortName: 'ACU', campus: 'North Sydney', lat: -33.8394, lng: 151.2038, url: 'https://www.acu.edu.au', color: '#1B3A6B' },
  ],
  QLD: [
    { name: 'University of Queensland', shortName: 'UQ', campus: 'St Lucia', lat: -27.4975, lng: 153.0137, url: 'https://www.uq.edu.au', color: '#51247A' },
    { name: 'Queensland University of Technology', shortName: 'QUT', campus: 'Gardens Point', lat: -27.4784, lng: 153.0281, url: 'https://www.qut.edu.au', color: '#005DA8' },
    { name: 'Griffith University', shortName: 'Griffith', campus: 'Nathan', lat: -27.5533, lng: 153.0530, url: 'https://www.griffith.edu.au', color: '#E4002B' },
    { name: 'James Cook University', shortName: 'JCU', campus: 'Townsville', lat: -19.3316, lng: 146.7546, url: 'https://www.jcu.edu.au', color: '#003D7C' },
    { name: 'Bond University', shortName: 'Bond', campus: 'Gold Coast', lat: -28.0729, lng: 153.3844, url: 'https://bond.edu.au', color: '#002060' },
    { name: 'University of Southern Queensland', shortName: 'UniSQ', campus: 'Toowoomba', lat: -27.5620, lng: 151.9390, url: 'https://www.unisq.edu.au', color: '#003087' },
  ],
  SA: [
    { name: 'University of Adelaide', shortName: 'UofA', campus: 'Adelaide', lat: -34.9204, lng: 138.6035, url: 'https://www.adelaide.edu.au', color: '#005A9C' },
    { name: 'Flinders University', shortName: 'Flinders', campus: 'Bedford Park', lat: -35.0228, lng: 138.5694, url: 'https://www.flinders.edu.au', color: '#FFD100' },
    { name: 'University of South Australia', shortName: 'UniSA', campus: 'City West', lat: -34.9200, lng: 138.5985, url: 'https://www.unisa.edu.au', color: '#E4002B' },
  ],
  WA: [
    { name: 'University of Western Australia', shortName: 'UWA', campus: 'Crawley', lat: -31.9805, lng: 115.8191, url: 'https://www.uwa.edu.au', color: '#003087' },
    { name: 'Curtin University', shortName: 'Curtin', campus: 'Bentley', lat: -32.0059, lng: 115.8941, url: 'https://www.curtin.edu.au', color: '#FFD100' },
    { name: 'Murdoch University', shortName: 'Murdoch', campus: 'Murdoch', lat: -32.0706, lng: 115.8351, url: 'https://www.murdoch.edu.au', color: '#003D7C' },
    { name: 'Edith Cowan University', shortName: 'ECU', campus: 'Joondalup', lat: -31.7454, lng: 115.7674, url: 'https://www.ecu.edu.au', color: '#E4002B' },
  ],
  TAS: [
    { name: 'University of Tasmania', shortName: 'UTAS', campus: 'Hobart', lat: -42.8985, lng: 147.3272, url: 'https://www.utas.edu.au', color: '#006938' },
    { name: 'University of Tasmania', shortName: 'UTAS', campus: 'Launceston', lat: -41.4545, lng: 147.1490, url: 'https://www.utas.edu.au/campuses/launceston', color: '#006938' },
  ],
  NT: [
    { name: 'Charles Darwin University', shortName: 'CDU', campus: 'Darwin', lat: -12.3714, lng: 130.8663, url: 'https://www.cdu.edu.au', color: '#E4002B' },
    { name: 'Charles Darwin University', shortName: 'CDU', campus: 'Alice Springs', lat: -23.6980, lng: 133.8807, url: 'https://www.cdu.edu.au/campuses/alice-springs', color: '#E4002B' },
  ],
}

// Hardcoded major library branches per state (non-VIC, for map pins)
const STATE_LIBRARIES: Record<string, { name: string; suburb: string; lat: number; lng: number; url: string }[]> = {
  NSW: [
    { name: 'State Library of NSW', suburb: 'Sydney CBD', lat: -33.8688, lng: 151.2127, url: 'https://www.sl.nsw.gov.au' },
    { name: 'Surry Hills Library', suburb: 'Surry Hills', lat: -33.8850, lng: 151.2100, url: 'https://www.cityofsydney.nsw.gov.au/libraries' },
    { name: 'Parramatta City Library', suburb: 'Parramatta', lat: -33.8147, lng: 151.0024, url: 'https://www.cityofparramatta.nsw.gov.au/community/libraries' },
    { name: 'Chatswood Library', suburb: 'Chatswood', lat: -33.7971, lng: 151.1830, url: 'https://www.willoughby.nsw.gov.au/Community/Libraries' },
    { name: 'Blacktown City Library', suburb: 'Blacktown', lat: -33.7689, lng: 150.9056, url: 'https://www.blacktown.nsw.gov.au/Community-and-culture/Libraries' },
    { name: 'Liverpool City Library', suburb: 'Liverpool', lat: -33.9200, lng: 150.9238, url: 'https://www.liverpool.nsw.gov.au/library' },
    { name: 'Newcastle City Library', suburb: 'Newcastle', lat: -32.9283, lng: 151.7817, url: 'https://newcastlelibraries.com.au' },
    { name: 'Wollongong City Library', suburb: 'Wollongong', lat: -34.4278, lng: 150.8931, url: 'https://wollongong.nsw.gov.au/library' },
  ],
  QLD: [
    { name: 'State Library of Queensland', suburb: 'South Bank', lat: -27.4755, lng: 153.0197, url: 'https://www.slq.qld.gov.au' },
    { name: 'Brisbane Square Library', suburb: 'Brisbane CBD', lat: -27.4679, lng: 153.0236, url: 'https://www.brisbane.qld.gov.au/library' },
    { name: 'Chermside Library', suburb: 'Chermside', lat: -27.3876, lng: 153.0318, url: 'https://www.brisbane.qld.gov.au/library' },
    { name: 'Sunnybank Hills Library', suburb: 'Sunnybank Hills', lat: -27.5887, lng: 153.0469, url: 'https://www.brisbane.qld.gov.au/library' },
    { name: 'Robina Library', suburb: 'Gold Coast', lat: -28.0778, lng: 153.3789, url: 'https://www.goldcoast.qld.gov.au/library' },
    { name: 'Sunshine Coast Library HQ', suburb: 'Maroochydore', lat: -26.6533, lng: 153.0893, url: 'https://library.sunshinecoast.qld.gov.au' },
  ],
  SA: [
    { name: 'State Library of South Australia', suburb: 'Adelaide CBD', lat: -34.9231, lng: 138.5988, url: 'https://www.slsa.sa.gov.au' },
    { name: 'Adelaide City Library', suburb: 'Adelaide CBD', lat: -34.9270, lng: 138.5999, url: 'https://www.cityofadelaide.com.au/community/libraries' },
    { name: 'Prospect Library', suburb: 'Prospect', lat: -34.8871, lng: 138.5992, url: 'https://www.prospect.sa.gov.au/library' },
    { name: 'Tea Tree Gully Library', suburb: 'Modbury', lat: -34.8310, lng: 138.6866, url: 'https://www.teatreegully.sa.gov.au/library' },
    { name: 'Holdfast Bay Library', suburb: 'Glenelg', lat: -34.9826, lng: 138.5151, url: 'https://www.holdfast.sa.gov.au/library' },
  ],
  WA: [
    { name: 'State Library of Western Australia', suburb: 'Perth CBD', lat: -31.9528, lng: 115.8605, url: 'https://slwa.wa.gov.au' },
    { name: 'Perth City Library', suburb: 'Perth CBD', lat: -31.9552, lng: 115.8590, url: 'https://www.perth.wa.gov.au/library' },
    { name: 'Mirrabooka Library', suburb: 'Mirrabooka', lat: -31.8618, lng: 115.8605, url: 'https://www.stirling.wa.gov.au/attractions-and-recreation/libraries-and-hubs' },
    { name: 'Joondalup Library', suburb: 'Joondalup', lat: -31.7459, lng: 115.7675, url: 'https://www.joondalup.wa.gov.au/community-and-spaces/libraries' },
    { name: 'Fremantle Library', suburb: 'Fremantle', lat: -32.0550, lng: 115.7476, url: 'https://www.fremantle.wa.gov.au/library' },
    { name: 'Midland Library', suburb: 'Midland', lat: -31.8893, lng: 116.0028, url: 'https://www.swan.wa.gov.au/library' },
  ],
  TAS: [
    { name: 'State Library of Tasmania', suburb: 'Hobart', lat: -42.8821, lng: 147.3272, url: 'https://libraries.tas.gov.au' },
    { name: 'Hobart City Library', suburb: 'Hobart CBD', lat: -42.8821, lng: 147.3272, url: 'https://www.hobartcity.com.au/library' },
    { name: 'Launceston Library', suburb: 'Launceston', lat: -41.4332, lng: 147.1441, url: 'https://libraries.tas.gov.au' },
    { name: 'Devonport Library', suburb: 'Devonport', lat: -41.1758, lng: 146.3585, url: 'https://libraries.tas.gov.au' },
  ],
  NT: [
    { name: 'NT Library', suburb: 'Darwin CBD', lat: -12.4634, lng: 130.8456, url: 'https://www.ntl.nt.gov.au' },
    { name: 'Darwin City Library', suburb: 'Darwin', lat: -12.4634, lng: 130.8440, url: 'https://www.darwin.nt.gov.au/community/libraries' },
    { name: 'Alice Springs Public Library', suburb: 'Alice Springs', lat: -23.7020, lng: 133.8807, url: 'https://www.alicesprings.nt.gov.au/residents/facilities/library' },
    { name: 'Palmerston Library', suburb: 'Palmerston', lat: -12.4877, lng: 130.9830, url: 'https://www.palmerston.nt.gov.au/library' },
  ],
}

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
  const [activeState, setActiveState] = useState<string>('VIC')
  const geojsonByState = useRef<Record<string, unknown>>({})
  const councilsRef = useRef<Council[]>([])

  useEffect(() => {
    fetch(`/api/councils?state=${activeState}`).then(r => r.json()).then(data => {
      setCouncils(data)
      councilsRef.current = data
    })
  }, [activeState])

  const toggleLibraries = useCallback(async () => {
    if (!showLibraries) {
      if (activeState === 'VIC') {
        if (!librariesLoaded) {
          const data = await fetch('/api/libraries?map=true').then(r => r.json())
          setLibraries(data)
          setLibrariesLoaded(true)
        }
      } else {
        const pins = (STATE_LIBRARIES[activeState] ?? []).map(l => ({
          id: l.name, name: l.name, address: l.suburb, suburb: null,
          councilId: '', lat: l.lat, lng: l.lng, url: l.url, phone: null, hoursJson: null,
        }))
        setLibraries(pins)
      }
    }
    setShowLibraries(prev => !prev)
  }, [showLibraries, librariesLoaded, activeState])

  // Update fill-color when state or councils change
  useEffect(() => {
    if (!mapRef.current) return
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      const map = mapRef.current as mapboxgl.Map
      if (!map.getLayer('lga-fill')) return
      const nonVicColors = STATE_REGION_COLORS[activeState]
      if (nonVicColors && activeState !== 'VIC') {
        const colorExpr: unknown[] = ['match', ['get', 'lga_region']]
        for (const [region, color] of Object.entries(nonVicColors)) {
          colorExpr.push(region, color)
        }
        colorExpr.push('#e5e7eb')
        map.setPaintProperty('lga-fill', 'fill-color', colorExpr as mapboxgl.Expression)
        map.setPaintProperty('lga-fill', 'fill-opacity', 0.45)
      } else {
        const slugToRegion = Object.fromEntries(councils.map(c => [c.id, c.region]))
        const colorExpr: unknown[] = ['match', ['get', 'lga_slug']]
        for (const [slug, region] of Object.entries(slugToRegion)) {
          colorExpr.push(slug, REGION_COLORS[region] ?? '#e5e7eb')
        }
        colorExpr.push('#e5e7eb')
        map.setPaintProperty('lga-fill', 'fill-color', colorExpr as mapboxgl.Expression)
        map.setPaintProperty('lga-fill', 'fill-opacity', 0.5)
      }
    })
  }, [councils, activeState])

  // Update fill opacity when activeRegion changes
  useEffect(() => {
    if (!mapRef.current) return
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      const map = mapRef.current as mapboxgl.Map
      if (!map.getLayer('lga-fill')) return
      if (!activeRegion) {
        map.setPaintProperty('lga-fill', 'fill-opacity', activeState === 'VIC' ? 0.5 : 0.45)
        return
      }
      const regionSlugs = councils.filter(c => c.region === activeRegion).map(c => c.id)
      const opacityExpr: unknown[] = ['match', ['get', 'lga_slug'], ...regionSlugs.flatMap(s => [s, 0.75]), 0.15]
      map.setPaintProperty('lga-fill', 'fill-opacity', opacityExpr as mapboxgl.Expression)
    })
  }, [activeRegion, councils, activeState])

  const flyToRegion = useCallback((region: string) => {
    const next = activeRegion === region ? null : region
    setActiveRegion(next)
    if (!next || !mapRef.current) return

    const geojson = activeState === 'VIC'
      ? geojsonRef.current
      : (geojsonByState.current[activeState] as typeof geojsonRef.current | null) ?? null
    if (!geojson) return

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      const map = mapRef.current as mapboxgl.Map
      const regionSlugs = new Set(councils.filter(c => c.region === next).map(c => c.id))
      // For non-VIC states, match by lga_region property directly
      const features = activeState === 'VIC'
        ? geojson.features.filter((f: { properties: Record<string, string> }) => regionSlugs.has(f.properties.lga_slug))
        : geojson.features.filter((f: { properties: Record<string, string> }) => f.properties.lga_region === next)
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
  }, [activeRegion, activeState, councils])

  const switchState = useCallback(async (state: string) => {
    setActiveState(state)
    setActiveRegion(null)
    // Reset library data so new state's pins load on next toggle
    setLibraries([])
    setLibrariesLoaded(false)
    setShowLibraries(false)
    setShowUniversities(false)

    const map = mapRef.current
    if (!map) return

    import('mapbox-gl').then(async ({ default: mapboxgl }) => {
      const m = map as mapboxgl.Map
      const bounds = STATE_BOUNDS[state]
      if (bounds) m.fitBounds(bounds, { padding: 40, duration: 800 })

      if (state === 'VIC') {
        if (geojsonRef.current) {
          (m.getSource('lgas') as mapboxgl.GeoJSONSource)?.setData(geojsonRef.current as unknown as GeoJSON.FeatureCollection)
        }
        return
      }

      const filename = `${state.toLowerCase()}-lgas.geojson`
      if (!geojsonByState.current[state]) {
        try {
          const res = await fetch(`/${filename}`)
          if (res.ok) {
            geojsonByState.current[state] = await res.json()
          }
        } catch {
          console.warn(`No GeoJSON for ${state}`)
        }
      }

      const data = geojsonByState.current[state]
      if (data) {
        (m.getSource('lgas') as mapboxgl.GeoJSONSource)?.setData(data as unknown as GeoJSON.FeatureCollection)
      }
      if (m.getLayer('lga-fill')) {
        m.setPaintProperty('lga-fill', 'fill-opacity', 0.25)
      }
    })
  }, [])

  const flyToCouncil = useCallback((slug: string) => {
    if (!mapRef.current) return
    // For VIC use geojsonRef, for other states use geojsonByState cache
    const geojson = activeState === 'VIC'
      ? geojsonRef.current
      : (geojsonByState.current[activeState] as typeof geojsonRef.current | undefined) ?? null
    if (!geojson) return
    const feature = geojson.features.find((f: { properties: Record<string, string> }) => f.properties.lga_slug === slug)
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
  }, [activeState])

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

      for (const uni of (UNIVERSITIES_BY_STATE[activeState] ?? [])) {
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

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([uni.lng, uni.lat])
          .setPopup(popup)
          .addTo(mapRef.current as mapboxgl.Map)

        // Hover: show popup; click: open website
        el.addEventListener('mouseenter', (e) => {
          e.stopPropagation()
          setHoveredCouncil(null)
          uniMarkersRef.current.forEach(m => (m as mapboxgl.Marker).getPopup()?.remove())
          marker.togglePopup()
        })
        el.addEventListener('mouseleave', () => { marker.getPopup()?.remove() })
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          window.open(uni.url, '_blank', 'noopener,noreferrer')
        })

        uniMarkersRef.current.push(marker)
      }
    })
  }, [showUniversities, activeState])

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

        // Hover: show popup; click: open URL
        el.addEventListener('mouseenter', (e) => {
          e.stopPropagation()
          setHoveredCouncil(null)
          markersRef.current.forEach(m => (m as mapboxgl.Marker).getPopup()?.remove())
          marker.togglePopup()
        })
        el.addEventListener('mouseleave', () => { marker.getPopup()?.remove() })
        if (lib.url) {
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            window.open(lib.url!, '_blank', 'noopener,noreferrer')
          })
        }

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
          const props = e.features?.[0]?.properties as Record<string, string> | undefined
          const slug = props?.lga_slug
          const council = councilsRef.current.find(c => c.id === slug)
          // Fall back to raw LGA name from GeoJSON for regions not in DB
          const fallbackName = props?.lga_name ?? props?.lga_slug ?? ''
          setHoveredCouncil(council ?? (fallbackName ? { id: slug ?? '', name: fallbackName, region: '' } : null))
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

  const regionColors = activeState === 'VIC' ? REGION_COLORS : (STATE_REGION_COLORS[activeState] ?? {})
  const regionLabels = activeState === 'VIC' ? REGION_LABELS : (STATE_REGION_LABELS[activeState] ?? {})

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
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: (activeState === 'VIC' ? REGION_COLORS[c.region] : regionColors[c.region]) ?? '#e5e7eb' }} />
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
          <span>{showUniversities ? `Hide universities (${(UNIVERSITIES_BY_STATE[activeState] ?? []).length})` : 'Click to show universities'}</span>
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
        {/* State tabs — always visible */}
        <div className="flex flex-wrap gap-1 mt-2 mb-2 pb-2 border-b border-gray-100">
          {['VIC','NSW','QLD','SA','WA','TAS','NT'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => switchState(s)}
              className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors ${
                activeState === s
                  ? 'bg-(--color-primary) text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className={`${legendOpen ? 'block' : 'hidden'} sm:block`}>
        {Object.entries(regionLabels).map(([key, label]) => (
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
                backgroundColor: regionColors[key],
                transform: activeRegion === key ? 'scale(1.3)' : 'scale(1)',
              }}
            />
            <span className={activeRegion === key ? 'font-semibold text-gray-800' : 'text-gray-600'}>{label as string}</span>
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
        </div>{/* end collapsible */}
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
