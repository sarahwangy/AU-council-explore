import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'

interface ZoneFeature {
  type: 'Feature'
  geometry: { type: string; coordinates: unknown }
  properties: {
    School_Name: string
    ENTITY_CODE: number
    zoneType?: string
    [key: string]: unknown
  }
}

interface GeoJSON {
  type: 'FeatureCollection'
  features: ZoneFeature[]
}

// Per-state file names (all use same normalized schema: School_Name, ENTITY_CODE)
const STATE_ZONE_FILES: Record<string, { primary: string; secondary: string } | null> = {
  VIC: { primary: 'school-zones-primary.geojson', secondary: 'school-zones-secondary.geojson' },
  NSW: { primary: 'nsw-school-zones-primary.geojson', secondary: 'nsw-school-zones-secondary.geojson' },
  QLD: { primary: 'qld-school-zones-primary.geojson', secondary: 'qld-school-zones-secondary.geojson' },
  SA:  { primary: 'sa-school-zones-primary.geojson', secondary: 'sa-school-zones-secondary.geojson' },
  WA:  null,
  TAS: null,
  NT:  null,
  ACT: null,
}

// Cache loaded zone data (lazy, per state)
const zoneCache: Map<string, { primary: GeoJSON; secondary: GeoJSON }> = new Map()

function loadStateZones(state: string): { primary: GeoJSON; secondary: GeoJSON } | null {
  if (zoneCache.has(state)) return zoneCache.get(state)!
  const files = STATE_ZONE_FILES[state]
  if (!files) return null
  const pPath = resolve(process.cwd(), 'data', files.primary)
  const sPath = resolve(process.cwd(), 'data', files.secondary)
  if (!existsSync(pPath) || !existsSync(sPath)) return null
  const zones = {
    primary: JSON.parse(readFileSync(pPath, 'utf-8')) as GeoJSON,
    secondary: JSON.parse(readFileSync(sPath, 'utf-8')) as GeoJSON,
  }
  zoneCache.set(state, zones)
  return zones
}

function getBbox(feature: ZoneFeature): [number, number, number, number] {
  const coords: number[][] = []
  const geom = feature.geometry
  if (geom.type === 'Polygon') {
    coords.push(...(geom.coordinates as number[][][])[0])
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates as number[][][][]) {
      coords.push(...poly[0])
    }
  }
  const lngs = coords.map(c => c[0])
  const lats = coords.map(c => c[1])
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)]
}

function findFeatures(lat: number, lng: number, zones: GeoJSON): ZoneFeature[] {
  const pt = point([lng, lat])
  const results: ZoneFeature[] = []
  for (const feature of zones.features) {
    const [minLng, minLat, maxLng, maxLat] = getBbox(feature)
    if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue
    if (booleanPointInPolygon(pt, feature as Parameters<typeof booleanPointInPolygon>[1])) {
      results.push(feature)
    }
  }
  return results
}

async function getSuburb(lat: number, lng: number): Promise<string> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return ''
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=neighborhood,locality&limit=1`
    )
    const data = await res.json() as { features?: { text: string }[] }
    return data.features?.[0]?.text ?? ''
  } catch { return '' }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const state = (searchParams.get('state') ?? 'VIC').toUpperCase()

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  const stateZones = loadStateZones(state)
  if (!stateZones) {
    // State has no zone data — return empty result (frontend shows official link)
    const suburb = await getSuburb(lat, lng)
    return NextResponse.json({
      schools: [],
      suburb,
      zones: { type: 'FeatureCollection', features: [] },
      hasZoneData: false,
    })
  }

  const primaryFeatures = findFeatures(lat, lng, stateZones.primary)
  const secondaryFeatures = findFeatures(lat, lng, stateZones.secondary)

  const schools = [
    ...primaryFeatures.map(f => ({
      name: f.properties.School_Name,
      type: 'primary',
      address: '',
      suburb: '',
      education_sector: 'government',
      entityCode: f.properties.ENTITY_CODE,
    })),
    ...secondaryFeatures.map(f => ({
      name: f.properties.School_Name,
      type: 'secondary',
      address: '',
      suburb: '',
      education_sector: 'government',
      entityCode: f.properties.ENTITY_CODE,
    })),
  ]

  const zones = {
    type: 'FeatureCollection',
    features: [
      ...primaryFeatures.map(f => ({ ...f, properties: { ...f.properties, zoneType: 'primary' } })),
      ...secondaryFeatures.map(f => ({ ...f, properties: { ...f.properties, zoneType: 'secondary' } })),
    ],
  }

  const suburb = await getSuburb(lat, lng)

  return NextResponse.json({ schools, suburb, zones, hasZoneData: true })
}
