import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RADIUS_KM = 5

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const type = searchParams.get('type') ?? 'childcare' // childcare | playground | hospital
  const limit = parseInt(searchParams.get('limit') ?? '10')

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  // Bounding box pre-filter (1 degree ≈ 111km)
  const delta = RADIUS_KM / 111
  const latMin = lat - delta, latMax = lat + delta
  const lngMin = lng - delta, lngMax = lng + delta

  function distKm(a: number, b: number, c: number, d: number) {
    const R = 6371
    const dLat = ((c - a) * Math.PI) / 180
    const dLng = ((d - b) * Math.PI) / 180
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  }

  if (type === 'childcare') {
    const rows = await prisma.childcare.findMany({
      where: { lat: { gte: latMin, lte: latMax }, lng: { gte: lngMin, lte: lngMax }, state: 'VIC' },
    })
    const results = rows
      .map(r => ({ ...r, distance: distKm(lat, lng, r.lat!, r.lng!) }))
      .filter(r => r.distance <= RADIUS_KM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
    return NextResponse.json(results)
  }

  if (type === 'playground') {
    const rows = await prisma.playground.findMany({
      where: { lat: { gte: latMin, lte: latMax }, lng: { gte: lngMin, lte: lngMax }, state: 'VIC' },
    })
    const results = rows
      .map(r => ({ ...r, distance: distKm(lat, lng, r.lat, r.lng) }))
      .filter(r => r.distance <= RADIUS_KM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
    return NextResponse.json(results)
  }

  if (type === 'hospital') {
    const rows = await prisma.hospital.findMany({
      where: { lat: { gte: latMin, lte: latMax }, lng: { gte: lngMin, lte: lngMax }, state: 'VIC' },
    })
    const results = rows
      .map(r => ({ ...r, distance: distKm(lat, lng, r.lat, r.lng) }))
      .filter(r => r.distance <= RADIUS_KM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
    return NextResponse.json(results)
  }

  return NextResponse.json({ error: 'invalid type' }, { status: 400 })
}
