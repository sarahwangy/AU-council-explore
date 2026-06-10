import { prisma } from '@/lib/prisma'
import { EventCard } from '@/components/EventCard'

const CATEGORIES = ['English', 'Children', 'Cultural', 'Health', 'Craft', 'Reading']

interface Props {
  searchParams: Promise<{ council?: string; category?: string; range?: string; page?: string }>
}

function getDateRange(range?: string): { from: Date; to?: Date } {
  const now = new Date()
  if (range === 'today') {
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    return { from: now, to: end }
  }
  if (range === 'week') {
    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    return { from: now, to: end }
  }
  if (range === 'month') {
    const end = new Date(now)
    end.setMonth(end.getMonth() + 1)
    return { from: now, to: end }
  }
  return { from: now }
}

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const limit = 20
  const { from, to } = getDateRange(sp.range)

  const where = {
    ...(sp.council ? { councilId: sp.council } : {}),
    ...(sp.category ? { category: sp.category } : {}),
    startAt: { gte: from, ...(to ? { lte: to } : {}) },
  }

  const [events, total, councils] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { council: { select: { name: true } } },
      orderBy: { startAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
    prisma.council.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams()
    const merged = { ...sp, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    return `/events?${params}`
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-(--color-primary) mb-6" style={{ color: 'var(--color-primary)' }}>
        Melbourne Library Events
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <form method="get" action="/events" className="flex flex-wrap gap-3">
          <select name="council" defaultValue={sp.council ?? ''} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Councils</option>
            {councils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select name="category" defaultValue={sp.category ?? ''} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {sp.council && <input type="hidden" name="council" value={sp.council} />}
          {sp.category && <input type="hidden" name="category" value={sp.category} />}

          <button type="submit" className="px-4 py-2 text-sm bg-gray-100 rounded-lg border border-gray-300">
            Filter
          </button>
        </form>

        <div className="flex gap-1">
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This week' },
            { key: 'month', label: 'This month' },
          ].map(r => (
            <a
              key={r.key}
              href={buildUrl({ range: r.key, page: '1' })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                sp.range === r.key
                  ? 'text-white border-transparent'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={sp.range === r.key ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {r.label}
            </a>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} events found</p>

      {events.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No events found for this filter.</p>
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <EventCard
              key={e.id}
              title={e.title}
              council={e.council.name}
              venue={e.venue}
              startAt={e.startAt}
              category={e.category}
              bookingUrl={e.bookingUrl}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
          {page < totalPages && (
            <a href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              Next
            </a>
          )}
        </div>
      )}
    </main>
  )
}
