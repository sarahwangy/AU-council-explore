import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function extractLocation(q: string): string[] {
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

const CACHE_TTL_HOURS = 24

function normalizeQuery(q: string) {
  return q.toLowerCase().trim().replace(/\s+/g, ' ')
}

export async function POST(req: NextRequest) {
  try {
  const { query } = await req.json() as { query: string }
  if (!query?.trim()) return NextResponse.json({ error: 'No query' }, { status: 400 })

  const queryKey = normalizeQuery(query)

  // Check cache first (guard: aiSearchCache may be absent on old Prisma client)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cacheModel = (prisma as any).aiSearchCache
  const cached = cacheModel
    ? await cacheModel.findUnique({ where: { queryKey } })
    : null
  if (cached && cached.expiresAt > new Date()) {
    return NextResponse.json({ ...JSON.parse(cached.result), cached: true })
  }

  const keywords = query.trim().split(/\s+/).filter(w => w.length > 2)
  const locations = extractLocation(query)

  // 1. Search our database
  const [events, libraries] = await Promise.all([
    prisma.event.findMany({
      where: {
        OR: keywords.map(k => ({
          OR: [
            { title: { contains: k, mode: 'insensitive' } },
            { description: { contains: k, mode: 'insensitive' } },
            { venue: { contains: k, mode: 'insensitive' } },
          ],
        })),
        startAt: { gte: new Date() },
      },
      include: {
        council: { select: { name: true } },
        library: { select: { name: true, address: true, suburb: true } },
      },
      orderBy: { startAt: 'asc' },
      take: 12,
    }),
    prisma.library.findMany({
      where: locations.length > 0
        ? { OR: locations.map(loc => ({ OR: [{ suburb: { contains: loc, mode: 'insensitive' } }, { name: { contains: loc, mode: 'insensitive' } }] })) }
        : { OR: keywords.map(k => ({ OR: [{ name: { contains: k, mode: 'insensitive' } }, { suburb: { contains: k, mode: 'insensitive' } }] })) },
      include: { council: { select: { name: true } } },
      take: 5,
    }),
  ])

  // 2. Format DB context
  const eventContext = events.map(e => {
    const date = e.startAt.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const time = e.startAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Melbourne' })
    return `EVENT: "${e.title}" | ${date} ${time} | ${e.venue ?? ''}, ${e.library?.suburb ?? ''} | Council: ${e.council.name} | Library: ${e.library?.name ?? ''} | Free: ${e.isFree ? 'Yes' : 'No'} | Booking required: ${e.requiresBooking ? 'Yes' : 'No'} | URL: ${e.bookingUrl ?? ''}`
  }).join('\n')

  const libraryContext = libraries.map(l =>
    `LIBRARY: ${l.name} | ${l.address ?? ''}, ${l.suburb ?? ''} | Council: ${l.council.name}`
  ).join('\n')

  const dbContext = [eventContext, libraryContext].filter(Boolean).join('\n') || 'No matching items in our database.'

  // 3. Call Claude Sonnet with web_search tool for external enrichment
  const systemPrompt = `You are a helpful local community assistant for Victoria, Australia.
You have access to a database of Victorian council library events and library locations, AND you can search the web for additional local information.

When answering:
- First mention relevant events/libraries from our database (provided in the prompt)
- Use web search to find additional context: local classes, community groups, retail stores, external resources not in our database
- Format your response in clean Markdown with **bold** for key info, bullet points for lists, and ## headings for sections
- Keep it practical and local — specific addresses, dates, prices
- End with 2-3 actionable next steps`

  const userPrompt = `User query: "${query}"

Our database results:
${dbContext}

Please provide a comprehensive answer that:
1. Summarises what we found in our database
2. Searches the web for additional local resources, classes, groups, or places related to "${query}" in ${locations.length > 0 ? locations.join(', ') : 'Victoria, Australia'}
3. Combines both into a helpful, well-formatted response with Markdown formatting`

  let summary = ''
  try {
    // Use web search tool for external enrichment
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305' as const, name: 'web_search', max_uses: 3 }],
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    // Extract text from response (may include tool use blocks)
    const textBlocks = response.content.filter(b => b.type === 'text')
    summary = textBlocks.map(b => (b as { type: 'text'; text: string }).text).join('\n\n')

    // If tool was used and we need to continue the conversation
    if (response.stop_reason === 'tool_use') {
      // Continue conversation after tool results (handled by the API's internal loop)
      // The response already contains final text after tool execution
      summary = textBlocks.map(b => (b as { type: 'text'; text: string }).text).join('\n\n') || summary
    }
  } catch (err) {
    // Fallback to haiku without web search if web search fails
    console.error('Web search failed, falling back to haiku:', err)
    const fallback = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\n${userPrompt}`,
      }],
    })
    summary = (fallback.content[0] as { type: string; text: string }).text
  }

  const payload = {
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
  }

  // Write to cache (guard: aiSearchCache may be absent on old Prisma client)
  if (cacheModel) {
    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000)
    await cacheModel.upsert({
      where: { queryKey },
      create: { queryKey, result: JSON.stringify(payload), expiresAt },
      update: { result: JSON.stringify(payload), expiresAt, createdAt: new Date() },
    })
  }

  return NextResponse.json(payload)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[ai-search] unhandled error:', msg, err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
