import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EventCard } from '@/components/EventCard'
import { RegionBadge } from '@/components/RegionBadge'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function CouncilDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tab = 'overview' } = await searchParams

  const council = await prisma.council.findUnique({
    where: { id: slug },
    include: {
      stats: true,
      libraries: true,
      events: {
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: 'asc' },
        take: 30,
      },
    },
  })
  if (!council) notFound()

  const density =
    council.population && council.areaSqKm
      ? Math.round(council.population / council.areaSqKm)
      : null

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'events', label: `Library Events (${council.events.length})` },
    { key: 'facilities', label: 'Facilities' },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-(--color-primary)">{council.name}</h1>
        <RegionBadge region={council.region} />
      </div>
      {council.website && (
        <a href={council.website} target="_blank" rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:underline mb-6 block">
          {council.website}
        </a>
      )}

      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {TABS.map(t => (
          <a
            key={t.key}
            href={`/councils/${council.id}?tab=${t.key}`}
            className={`px-4 py-2 text-sm -mb-px border-b-2 transition-colors ${
              tab === t.key
                ? 'border-(--color-primary) text-(--color-primary) font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
            style={tab === t.key ? { borderBottomColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
          >
            {t.label}
          </a>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Population', value: council.population?.toLocaleString() ?? '—' },
              { label: 'Area (km²)', value: council.areaSqKm?.toFixed(1) ?? '—' },
              { label: 'Density', value: density ? `${density}/km²` : '—' },
              { label: 'Data year', value: String(council.stats?.dataYear ?? 2021) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-(--color-primary)" style={{ color: 'var(--color-primary)' }}>
                  {value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {council.stats && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold mb-3">Gender distribution</h2>
              <div className="flex rounded-full overflow-hidden h-4">
                <div
                  style={{ width: `${council.stats.malePercent ?? 50}%`, backgroundColor: '#60a5fa' }}
                />
                <div style={{ flex: 1, backgroundColor: '#f9a8d4' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Male {council.stats.malePercent?.toFixed(1)}%</span>
                <span>Female {council.stats.femalePercent?.toFixed(1)}%</span>
              </div>
              {council.stats.medianAge && (
                <p className="text-sm text-gray-600 mt-3">Median age: {council.stats.medianAge}</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'events' && (
        <div>
          {council.events.length === 0 ? (
            <p className="text-gray-500">No upcoming events found.</p>
          ) : (
            <div className="space-y-3">
              {council.events.map(e => (
                <EventCard
                  key={e.id}
                  title={e.title}
                  council={council.name}
                  venue={e.venue}
                  startAt={e.startAt}
                  category={e.category}
                  bookingUrl={e.bookingUrl}
                />
              ))}
            </div>
          )}
          <div className="mt-6">
            <a href={`/events?council=${council.id}`} className="text-sm text-(--color-primary) underline" style={{ color: 'var(--color-primary)' }}>
              View all events for {council.name} →
            </a>
          </div>
        </div>
      )}

      {tab === 'facilities' && (
        <div className="text-gray-500 py-8 text-center">
          <p>Facilities data (OSM Parks) coming soon.</p>
        </div>
      )}
    </main>
  )
}
