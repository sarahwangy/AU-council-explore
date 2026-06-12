import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { EventCard } from '@/components/EventCard'
import { StateTabs } from '@/components/StateTabs'
import { Suspense } from 'react'

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
    q?: string
    state?: string
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

async function NonVicEventsNotice({ state }: { state: string }) {
  const councils = await prisma.council.findMany({
    where: { state },
    select: { id: true, name: true, libraryUrl: true },
    orderBy: { name: 'asc' },
  })
  return (
    <div className="mb-8">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <p className="font-semibold text-amber-800 mb-1">📋 {state} event data not yet collected</p>
        <p className="text-sm text-amber-700">
          We don&apos;t scrape {state} council event systems yet. Visit each council&apos;s library website directly to find upcoming programs and events.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {councils.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-medium text-gray-800 mb-2">{c.name}</p>
            {c.libraryUrl && (
              <a href={c.libraryUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-purple-700 hover:underline">
                📚 Library Events →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams
  const { state: stateParam } = sp
  const activeState = stateParam ?? 'VIC'
  const page = parseInt(sp.page ?? '1')
  const limit = 20
  const council = Array.isArray(sp.council) ? sp.council[0] : sp.council
  const category = Array.isArray(sp.category) ? sp.category[0] : sp.category
  const date = sp.date
  const ageGroup = sp.ageGroup
  const freeOnly = sp.free === 'true'
  const noBooking = sp.noBooking === 'true'
  const q = sp.q?.trim() || undefined
  const { from, to } = getDateRange(sp.range, date)

  const where = {
    ...(council ? { councilId: council } : {}),
    ...(category ? { category } : {}),
    ...(ageGroup ? { ageGroup } : {}),
    ...(freeOnly ? { isFree: true } : {}),
    ...(noBooking ? { requiresBooking: false } : {}),
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
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
    if (q && !('q' in overrides)) params.set('q', q)
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
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-(--color-primary) mb-1">Community Events</h1>
          <p className="text-gray-500 text-sm">Library and council events across Victoria</p>
        </div>
        <a
          href={`/api/events/export?${new URLSearchParams({ ...(council ? { council } : {}), ...(category ? { category } : {}), ...(q ? { q } : {}) }).toString()}`}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shrink-0 mt-1"
        >
          ⬇ Export CSV
        </a>
      </div>

      <Suspense fallback={null}>
        <StateTabs basePath="/events" />
      </Suspense>

      {activeState !== 'VIC' && (
        <NonVicEventsNotice state={activeState} />
      )}

      {activeState === 'VIC' && (<>
      {/* Filter card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <form method="get" action="/events" className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
            <input
              type="text"
              name="q"
              defaultValue={q ?? ''}
              placeholder="e.g. kids, sewing, story time…"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

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

          {(council || category || sp.range || date || q) && (
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
      {(council || category || date || ageGroup || freeOnly || noBooking || q) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {q && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              🔍 "{q}"
              <a href={buildUrl({ q: '', page: '1' })} className="ml-1 hover:text-gray-900">×</a>
            </span>
          )}
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

      {/* Sources */}
      <div className="mt-10 pt-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-400 mb-1">Sources</p>
        <p className="text-xs text-gray-400">Events are scraped from council library booking systems — Humanitix, Eventbrite, and council-hosted platforms. Data updated daily via automated scraper.</p>
      </div>

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
      </>)}
    </main>
  )
}
