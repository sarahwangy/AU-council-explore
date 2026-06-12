import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? []
  const mapMode = searchParams.get('map') === 'true'

  // Map mode: return all libraries that have coordinates
  if (mapMode) {
    const libraries = await prisma.library.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      select: { id: true, name: true, councilId: true, address: true, suburb: true, phone: true, url: true, lat: true, lng: true, hoursJson: true },
    })
    return NextResponse.json(libraries)
  }

  if (ids.length === 0) return NextResponse.json([])

  const libraries = await prisma.library.findMany({
    where: { id: { in: ids } },
    include: { council: { select: { id: true, name: true } } },
    orderBy: [{ councilId: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(libraries)
}
