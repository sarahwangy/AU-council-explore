import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region')
  const councils = await prisma.council.findMany({
    where: region ? { region } : undefined,
    include: {
      stats: true,
      _count: { select: { libraries: true, events: true } },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(councils)
}
