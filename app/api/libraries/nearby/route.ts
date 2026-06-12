import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '5'), 20)

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  const libraries = await prisma.library.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    select: { id: true, name: true, councilId: true, address: true, suburb: true, url: true, lat: true, lng: true, hoursJson: true },
  })

  const withDistance = libraries
    .map(lib => ({
      ...lib,
      distance: haversine(lat, lng, lib.lat!, lib.lng!),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)

  return NextResponse.json(withDistance)
}
