import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const council = searchParams.get('council') || undefined
  const category = searchParams.get('category') || undefined
  const q = searchParams.get('q')?.trim() || undefined

  const events = await prisma.event.findMany({
    where: {
      ...(council ? { councilId: council } : {}),
      ...(category ? { category } : {}),
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      startAt: { gte: new Date() },
    },
    include: { council: { select: { name: true } } },
    orderBy: { startAt: 'asc' },
    take: 500,
  })

  const rows = [['Title', 'Council', 'Venue', 'Date', 'Category', 'Age Group', 'Free', 'Booking Required', 'URL']]
  for (const e of events) {
    rows.push([
      e.title,
      e.council.name,
      e.venue ?? '',
      e.startAt.toISOString(),
      e.category ?? '',
      e.ageGroup ?? '',
      e.isFree ? 'Yes' : 'No',
      e.requiresBooking ? 'Yes' : 'No',
      e.bookingUrl ?? '',
    ])
  }

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="victoria-events.csv"',
    },
  })
}
