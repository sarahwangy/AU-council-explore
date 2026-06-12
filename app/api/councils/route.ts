import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region') ?? undefined
  const state = req.nextUrl.searchParams.get('state') ?? 'VIC'

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
