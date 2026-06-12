import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { EventCard } from '@/components/EventCard'

const CATEGORIES = ['English', 'Children', 'Cultural', 'Health', 'Craft', 'Reading']

const AGE_PILLS = [
  { key: 'kids-0-5', label: '👶 Kids 0–5' },
  { key: 'school-age', label: '🎒 School Age' },
  { key: 'all-ages', label: '👨‍👩‍👧 All Ages' },
  { key: 'adult', label: '🧑 Adult' },
]

interface Props {
  searchParams: Promise<{
    council?: string | string[]
    category?: string | string[]
    range?: string
    date?: string
    page?: string
    ageGroup?: string
    free?: string
    noBooking?: string
  }>
}

function getDateRange(range?: string, date?: string): { from: Date; to?: Date } {
  // Specific date takes priority over range
  if (date) {
    const from = new Date(date)
    from.setHours(0, 0, 0, 0)
    const to = new Date(date)
    to.setHours(23, 59, 59, 999)
    return { from, to }
  }
  const now = new Date()
  if (range === 'today') {
    const to = new Date(now); to.setHours(23, 59, 59, 999)
    return { from: now, to }
  }
  if (range === 'week') {
    const to = new Date(now); to.setDate(to.getDate() + 7)
    return { from: now, to }
  }
  if (range === 'month') {
    const to = new Date(now); to.setMonth(to.getMonth() + 1)
    return { from: now, to }
  }
  return { from: now }
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const limit = 20
  const council = Array.isArray(sp.council) ? sp.council[0] : sp.council
  const category = Array.isArray(sp.category) ? sp.category[0] : sp.category
  const date = sp.date
  const ageGroup = sp.ageGroup
  const freeOnly = sp.free === 'true'
  const noBooking = sp.noBooking === 'true'
  const { from, to } = getDateRange(sp.range, date)

  const where = {
    ...(council ? { councilId: council } : {}),
    ...(category ? { category } : {}),
    ...(ageGroup ? { ageGroup } : {}),
    ...(freeOnly ? { isFree: true } : {}),
    ...(noBooking ? { requiresBooking: false } : {}),
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
  const today = toInputDate(new Date())

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams()
    if (council && !('council' in overrides)) params.set('council', council)
    if (category && !('category' in overrides)) params.set('category', category)
    if (ageGroup && !('ageGroup' in overrides)) params.set('ageGroup', ageGroup)
    if (freeOnly && !('free' in overrides)) params.set('free', 'true')
    if (noBooking && !('noBooking' in overrides)) params.set('noBooking', 'true')
    if (sp.range && !('range' in overrides) && !('date' in overrides)) params.set('range', sp.range)
    if (date && !('date' in overrides) && !('range' in overrides)) params.set('date', date)
    for (const [k, v] of Object.entries(overrides)) if (v) params.set(k, v)
    return `/events?${params}`
  }

  const RANGE_TABS = [
    { key: '', label: 'All upcoming' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This week' },
    { key: 'month', label: 'This month' },
  ]

  const activeRange = date ? '' : (sp.range ?? '')

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-primary) mb-1">Community Events</h1>
        <p className="text-gray-500 text-sm">Library and council events across Melbourne</p>
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <form method="get" action="/events" className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Council</label>
            <select
              name="council"
              title="Filter by council"
              defaultValue={council ?? ''}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 min-w-45"
            >
              <option value="">All Councils</option>
              {councils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
            <select
              name="category"
              title="Filter by category"
              defaultValue={category ?? ''}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pick a date</label>
            <input
              type="date"
              name="date"
              title="Pick a specific date"
              defaultValue={date ?? ''}
              min={today}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl bg-(--color-primary) hover:opacity-90 transition-opacity"
          >
            Apply
          </button>

          {(council || category || sp.range || date) && (
            <a
              href="/events"
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-xl border border-gray-200"
            >
              Clear all
            </a>
          )}
        </form>
      </div>

      {/* 💡 Free events notice */}
      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 text-sm text-green-800">
        <span className="shrink-0">💡</span>
        <span>Council library events are <strong>almost always free</strong> — no cost to attend. Just show up (or book a spot if required).</span>
      </div>

      {/* Quick date range pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {RANGE_TABS.map(r => (
          <a
            key={r.key}
            href={buildUrl({ range: r.key, date: '', page: '1' })}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
              activeRange === r.key && !date
                ? 'bg-(--color-primary) text-white border-transparent'
                : 'border-gray-300 text-gray-600 hover:border-(--color-primary) hover:text-(--color-primary)'
            }`}
          >
            {r.label}
          </a>
        ))}
      </div>

      {/* Age group pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-xs text-gray-400 self-center mr-1">Age:</span>
        {AGE_PILLS.map(a => (
          <a
            key={a.key}
            href={buildUrl({ ageGroup: ageGroup === a.key ? '' : a.key, page: '1' })}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              ageGroup === a.key
                ? 'bg-blue-600 text-white border-transparent'
                : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {a.label}
          </a>
        ))}
        <a
          href={buildUrl({ free: freeOnly ? '' : 'true', page: '1' })}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            freeOnly
              ? 'bg-green-600 text-white border-transparent'
              : 'border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-700'
          }`}
        >
          🟢 Free only
        </a>
        <a
          href={buildUrl({ noBooking: noBooking ? '' : 'true', page: '1' })}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            noBooking
              ? 'bg-orange-500 text-white border-transparent'
              : 'border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600'
          }`}
        >
          ✅ No booking needed
        </a>
      </div>

      {/* Active filter chips */}
      {(council || category || date || ageGroup || freeOnly || noBooking) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {date && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              📅 {new Date(date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
              <a href={buildUrl({ date: '', page: '1' })} className="ml-1 hover:text-indigo-900">×</a>
            </span>
          )}
          {council && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {councils.find(c => c.id === council)?.name ?? council}
              <a href={buildUrl({ council: '', page: '1' })} className="ml-1 hover:text-blue-900">×</a>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
              {category}
              <a href={buildUrl({ category: '', page: '1' })} className="ml-1 hover:text-purple-900">×</a>
            </span>
          )}
          {ageGroup && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {AGE_PILLS.find(a => a.key === ageGroup)?.label ?? ageGroup}
              <a href={buildUrl({ ageGroup: '', page: '1' })} className="ml-1 hover:text-blue-900">×</a>
            </span>
          )}
          {freeOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              🟢 Free only
              <a href={buildUrl({ free: '', page: '1' })} className="ml-1 hover:text-green-900">×</a>
            </span>
          )}
          {noBooking && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
              ✅ No booking needed
              <a href={buildUrl({ noBooking: '', page: '1' })} className="ml-1 hover:text-orange-900">×</a>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-4">
        {total === 0 ? 'No events found' : `${total} event${total === 1 ? '' : 's'} found`}
      </p>

      {/* Event list */}
      {events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">🗓️</div>
          <p className="text-gray-500 font-medium mb-1">No events match your filters</p>
          <p className="text-gray-400 text-sm mb-4">
            {date ? 'Try a different date or clear the date filter' : 'Try a different council or date range'}
          </p>
          <a href="/events" className="text-sm text-(--color-primary) underline">Clear all filters</a>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(e => {
            const councilSlug = councils.find(c => c.name === e.council.name)?.id ?? ''
            return (
              <div key={e.id} className="relative group">
                <Link href={`/councils/${councilSlug}`} className="absolute inset-0 z-0" aria-label={`View ${e.council.name}`} />
                <div className="relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
                  <EventCard
                    title={e.title}
                    council={e.council.name}
                    venue={e.venue}
                    startAt={e.startAt}
                    category={e.category}
                    bookingUrl={e.bookingUrl}
                    source={e.source}
                    isFree={e.isFree}
                    requiresBooking={e.requiresBooking}
                    ageGroup={e.ageGroup}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          {page > 1 && (
            <a href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
              ← Previous
            </a>
          )}
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <a href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
              Next →
            </a>
          )}
        </div>
      )}
    </main>
  )
}
