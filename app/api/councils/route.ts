import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region') ?? undefined
  const state = req.nextUrl.searchParams.get('state') ?? 'VIC'
  const search = req.nextUrl.searchParams.get('search') ?? undefined

  // Global search across all states
  if (search) {
    const councils = await prisma.council.findMany({
      where: { name: { contains: search, mode: 'insensitive' } },
      select: { id: true, name: true, state: true, region: true },
      orderBy: { name: 'asc' },
      take: 10,
    })
    return NextResponse.json(councils)
  }

  const councils = await prisma.council.findMany({
    where: {
      state,
      ...(region ? { region } : {}),
    },
    include: {
      stats: true,
      _count: { select: { libraries: true, events: true } },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(councils)
}
