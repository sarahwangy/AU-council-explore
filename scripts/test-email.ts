import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#') && v.length) process.env[k.trim()] = v.join('=').trim()
  })
}

import { Resend } from 'resend'
import { prisma } from '../lib/prisma'
import { WeeklyDigest } from '../emails/WeeklyDigest'

const resend = new Resend(process.env.RESEND_API_KEY)

async function main() {
  // Find the subscriber in the database
  // Usage: npx tsx scripts/test-email.ts
  // Sends to TEST_EMAIL env var, or falls back to most recently subscribed user
  const testEmail = process.env.TEST_EMAIL
  const subscriber = await prisma.subscriber.findFirst({
    where: { active: true, ...(testEmail ? { email: testEmail } : {}) },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscriber) {
    console.error('No active subscriber found in DB. Subscribe via the website first.')
    process.exit(1)
  }

  console.log(`Sending to: ${subscriber.email}`)
  console.log(`Councils: ${subscriber.councils.join(', ')}`)

  const now = new Date()
  const weekAhead = new Date(now)
  weekAhead.setDate(weekAhead.getDate() + 7)

  const events = await prisma.event.findMany({
    where: {
      councilId: { in: subscriber.councils },
      startAt: { gte: now, lte: weekAhead },
    },
    include: { council: { select: { name: true } } },
    orderBy: { startAt: 'asc' },
    take: 15,
  })

  const councils = await prisma.council.findMany({
    where: { id: { in: subscriber.councils } },
    select: { name: true },
  })

  console.log(`Found ${events.length} events in next 7 days for these councils`)

  if (events.length === 0) {
    console.log('No events found — subscribed councils may not have scraped data yet.')
    console.log('Councils with data: kingston, melton, maroondah, moonee-valley')
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3010'

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: subscriber.email,
    subject: `[TEST] Your Melbourne Council Events — ${now.toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}`,
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
      unsubscribeUrl: `${baseUrl}/api/unsubscribe?token=${subscriber.token}`,
    }),
  })

  if (error) {
    console.error('Send failed:', error)
  } else {
    console.log(`Email sent! ID: ${data?.id}`)
    console.log(`Check ${subscriber.email}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
