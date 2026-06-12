import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Extract suburb/location hints from query
function extractLocation(q: string): string[] {
  const words = q.toLowerCase().split(/\s+/)
  // Common Melbourne/VIC suburbs — extended list
  const knownSuburbs = [
    'melbourne', 'richmond', 'fitzroy', 'collingwood', 'hawthorn', 'camberwell',
    'box hill', 'clayton', 'dandenong', 'frankston', 'ringwood', 'doncaster',
    'epping', 'bundoora', 'reservoir', 'preston', 'thornbury', 'northcote',
    'brunswick', 'coburg', 'essendon', 'moonee ponds', 'footscray', 'sunshine',
    'williamstown', 'newport', 'glen waverley', 'mount waverley', 'mt waverley',
    'oakleigh', 'chadstone', 'glen iris', 'malvern', 'prahran', 'st kilda',
    'port melbourne', 'south yarra', 'toorak', 'armadale', 'glen eira',
    'bentleigh', 'moorabbin', 'cheltenham', 'mentone', 'mordialloc', 'aspendale',
    'geelong', 'ballarat', 'bendigo', 'werribee', 'hoppers crossing', 'point cook',
    'tarneit', 'truganina', 'narre warren', 'cranbourne', 'pakenham', 'berwick',
    'endeavour hills', 'hampton park', 'doveton', 'seaford', 'carrum downs',
  ]
  const qLower = q.toLowerCase()
  return knownSuburbs.filter(s => qLower.includes(s))
}

export async function POST(req: NextRequest) {
  const { query } = await req.json() as { query: string }
  if (!query?.trim()) return NextResponse.json({ error: 'No query' }, { status: 400 })

  // 1. Search events: keywords from query
  const keywords = query.trim().split(/\s+/).filter(w => w.length > 2)
  const locations = extractLocation(query)

  const [events, libraries] = await Promise.all([
    prisma.event.findMany({
      where: {
        OR: keywords.map(k => ({
          OR: [
            { title: { contains: k, mode: 'insensitive' } },
            { description: { contains: k, mode: 'insensitive' } },
            { venue: { contains: k, mode: 'insensitive' } },
            { category: { contains: k, mode: 'insensitive' } },
          ],
        })),
        startAt: { gte: new Date() },
      },
      include: { council: { select: { name: true } }, library: { select: { name: true, address: true, suburb: true } } },
      orderBy: { startAt: 'asc' },
      take: 15,
    }),
    prisma.library.findMany({
      where: locations.length > 0
        ? {
            OR: locations.map(loc => ({
              OR: [
                { suburb: { contains: loc, mode: 'insensitive' } },
                { name: { contains: loc, mode: 'insensitive' } },
                { address: { contains: loc, mode: 'insensitive' } },
              ],
            })),
          }
        : {
            OR: keywords.map(k => ({
              OR: [
                { name: { contains: k, mode: 'insensitive' } },
                { suburb: { contains: k, mode: 'insensitive' } },
              ],
            })),
          },
      include: { council: { select: { name: true } } },
      take: 5,
    }),
  ])

  // 2. Format context for Claude
  const eventContext = events.map(e => {
    const date = e.startAt.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const time = e.startAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Melbourne' })
    return `EVENT: "${e.title}" | ${date} ${time} | Venue: ${e.venue ?? 'TBC'} | Council: ${e.council.name} | Library: ${e.library?.name ?? ''} | Free: ${e.isFree ? 'Yes' : 'No'} | Booking: ${e.requiresBooking ? 'Required' : 'Not required'} | URL: ${e.bookingUrl ?? ''}`
  }).join('\n')

  const libraryContext = libraries.map(l =>
    `LIBRARY: ${l.name} | Address: ${l.address ?? ''}, ${l.suburb ?? ''} | Council: ${l.council.name}`
  ).join('\n')

  const hasData = events.length > 0 || libraries.length > 0
  const context = hasData
    ? `${eventContext}\n${libraryContext}`.trim()
    : 'No matching events or libraries found in our database for this query.'

  // 3. Call Claude Haiku for fast, cheap response
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a helpful assistant for the Victoria Council Explorer — a community guide for Victorian councils, libraries, and events.

User query: "${query}"

Data from our database:
${context}

Write a concise, friendly AI Overview (3-5 sentences max) that directly answers the user's query using the data above.
- If specific events are found, mention dates, venues, and booking info
- If a location was mentioned, mention the specific library/venue
- If no data found, suggest what they might try (broader search, check council website)
- Do NOT make up events or dates not in the data
- End with 1-2 practical next steps the user can take
- Keep it conversational, helpful, under 120 words`,
    }],
  })

  const summary = (message.content[0] as { type: string; text: string }).text

  // 4. Return results
  return NextResponse.json({
    summary,
    events: events.slice(0, 8).map(e => ({
      id: e.id,
      title: e.title,
      venue: e.venue,
      suburb: e.library?.suburb,
      startAt: e.startAt,
      councilName: e.council.name,
      libraryName: e.library?.name,
      isFree: e.isFree,
      requiresBooking: e.requiresBooking,
      bookingUrl: e.bookingUrl,
    })),
    libraries: libraries.map(l => ({
      id: l.id,
      name: l.name,
      address: l.address,
      suburb: l.suburb,
      councilName: l.council.name,
      url: l.url,
    })),
  })
}
