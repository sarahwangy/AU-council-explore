import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'

interface ZoneFeature {
  type: 'Feature'
  geometry: { type: string; coordinates: unknown }
  properties: {
    School_Name: string
    Campus_Name?: string
    ENTITY_CODE: number
    Year_Level: string
    Boundary_Year: number
  }
}

interface GeoJSON {
  type: 'FeatureCollection'
  features: ZoneFeature[]
}

// Load once at module level (cached across requests in the same worker)
let primaryZones: GeoJSON | null = null
let secondaryZones: GeoJSON | null = null

function loadZones() {
  if (!primaryZones) {
    const p = resolve(process.cwd(), 'data/school-zones-primary.geojson')
    primaryZones = JSON.parse(readFileSync(p, 'utf-8')) as GeoJSON
  }
  if (!secondaryZones) {
    const p = resolve(process.cwd(), 'data/school-zones-secondary.geojson')
    secondaryZones = JSON.parse(readFileSync(p, 'utf-8')) as GeoJSON
  }
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

function findSchools(lat: number, lng: number, zones: GeoJSON): ZoneFeature['properties'][] {
  const pt = point([lng, lat])
  const results: ZoneFeature['properties'][] = []
  for (const feature of zones.features) {
    // Bounding box pre-filter for performance
    const [minLng, minLat, maxLng, maxLat] = getBbox(feature)
    if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue
    if (booleanPointInPolygon(pt, feature as Parameters<typeof booleanPointInPolygon>[1])) {
      results.push(feature.properties)
    }
  }
  return results
}

// Simple suburb lookup from Mapbox reverse geocode
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

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  try {
    loadZones()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Zone data not loaded: ${msg}` }, { status: 500 })
  }

  const primaryMatches = findSchools(lat, lng, primaryZones!)
  const secondaryMatches = findSchools(lat, lng, secondaryZones!)

  const schools = [
    ...primaryMatches.map(p => ({
      name: p.School_Name,
      type: 'primary',
      address: '',
      suburb: '',
      education_sector: 'government',
      entityCode: p.ENTITY_CODE,
    })),
    ...secondaryMatches.map(p => ({
      name: p.School_Name,
      type: 'secondary',
      address: '',
      suburb: '',
      education_sector: 'government',
      entityCode: p.ENTITY_CODE,
    })),
  ]

  const suburb = await getSuburb(lat, lng)

  return NextResponse.json({ schools, suburb })
}
