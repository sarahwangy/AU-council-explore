import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { WeeklyDigest } from '@/emails/WeeklyDigest'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  // Protect cron endpoint
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscribers = await prisma.subscriber.findMany({ where: { active: true } })
  if (subscribers.length === 0) return NextResponse.json({ sent: 0 })

  const now = new Date()
  const weekAhead = new Date(now)
  weekAhead.setDate(weekAhead.getDate() + 7)

  let sent = 0
  const errors: string[] = []

  for (const sub of subscribers) {
    try {
      const events = await prisma.event.findMany({
        where: {
          councilId: { in: sub.councils },
          startAt: { gte: now, lte: weekAhead },
        },
        include: { council: { select: { name: true } } },
        orderBy: { startAt: 'asc' },
        take: 15,
      })

      const councils = await prisma.council.findMany({
        where: { id: { in: sub.councils } },
        select: { name: true },
      })

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://au-council-explore.vercel.app'
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${sub.token}`

      await resend.emails.send({
        from: 'Melbourne Council Explorer <digest@sarahwangy.com>',
        to: sub.email,
        subject: `Your weekly events — ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}`,
        react: WeeklyDigest({
          events: events.map(e => ({
            title: e.title,
            councilName: e.council.name,
            venue: e.venue,
            startAt: e.startAt,
            bookingUrl: e.bookingUrl,
            category: e.category,
          })),
          councilNames: councils.map(c => c.name),
          unsubscribeUrl,
        }),
      })

      await prisma.subscriber.update({ where: { id: sub.id }, data: { lastSentAt: now } })
      sent++
    } catch (err) {
      errors.push(`${sub.email}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ sent, errors })
}
