import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const council = await prisma.council.findUnique({
    where: { id: slug },
    include: {
      stats: true,
      libraries: true,
      events: {
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: 'asc' },
        take: 20,
      },
    },
  })
  if (!council) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(council)
}
