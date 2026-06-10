import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const councilId = searchParams.get('council')
  // councils= accepts comma-separated ids for My Events filtering
  const councilsParam = searchParams.get('councils')
  const councilIds = councilsParam ? councilsParam.split(',').filter(Boolean) : null
  const category = searchParams.get('category')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)

  const where = {
    ...(councilIds ? { councilId: { in: councilIds } } : councilId ? { councilId } : {}),
    ...(category ? { category } : {}),
    startAt: {
      gte: from ? new Date(from) : new Date(),
      ...(to ? { lte: new Date(to) } : {}),
    },
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { council: { select: { name: true, region: true } } },
      orderBy: { startAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  return NextResponse.json({ events, total, page, limit })
}
