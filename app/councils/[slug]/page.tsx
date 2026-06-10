import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EventCard } from '@/components/EventCard'
import { RegionBadge } from '@/components/RegionBadge'
import { FavoriteButton } from '@/components/FavoriteButton'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

// Age bar colours are static per row — defined outside JSX so they're not recreated per render
const AGE_ROWS = [
  { label: '0–4 yrs',   sublabel: 'Childcare age',    key: 'agePct0to4',   barClass: 'bg-violet-400' },
  { label: '5–14 yrs',  sublabel: 'Primary school',   key: 'agePct5to14',  barClass: 'bg-blue-400'   },
  { label: '15–19 yrs', sublabel: 'Secondary school', key: 'agePct15to19', barClass: 'bg-emerald-400' },
  { label: '20–39 yrs', sublabel: 'Young adults',     key: 'agePct20to39', barClass: 'bg-amber-400'  },
  { label: '40–64 yrs', sublabel: 'Middle age',       key: 'agePct40to64', barClass: 'bg-orange-400' },
  { label: '65+ yrs',   sublabel: 'Seniors',          key: 'agePct65plus', barClass: 'bg-slate-400'  },
] as const

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
        <FavoriteButton councilId={council.id} className="text-(--color-accent) text-2xl" />
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
                <div className="text-2xl font-bold text-(--color-primary)">{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {council.stats && (
            <div className="space-y-4">
              {/* Gender */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="font-semibold mb-3">Gender distribution</h2>
                <div className="flex rounded-full overflow-hidden h-4">
                  <div
                    className="bg-blue-400 h-full"
                    style={{ width: `${council.stats.malePercent ?? 50}%` }}
                  />
                  <div className="bg-pink-300 flex-1" />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Male {council.stats.malePercent?.toFixed(1)}%</span>
                  <span>Female {council.stats.femalePercent?.toFixed(1)}%</span>
                </div>
                {council.stats.medianAge && (
                  <p className="text-sm text-gray-600 mt-3">Median age: {council.stats.medianAge}</p>
                )}
              </div>

              {/* Age groups */}
              {council.stats.agePct0to4 != null && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h2 className="font-semibold mb-4">Age distribution</h2>
                  <div className="space-y-3">
                    {AGE_ROWS.map(({ label, sublabel, key, barClass }) => {
                      const pct = council.stats![key]
                      if (pct == null) return null
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {label}{' '}
                              <span className="text-gray-400 font-normal text-xs">{sublabel}</span>
                            </span>
                            <span className="text-gray-600">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${barClass}`}
                              style={{ width: `${Math.min(pct * 3, 100)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Source: ABS 2021 Census G04</p>
                </div>
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
            <a href={`/events?council=${council.id}`} className="text-sm text-(--color-primary) underline">
              View all events for {council.name} →
            </a>
          </div>
        </div>
      )}

      {tab === 'facilities' && (
        <div className="text-gray-500 py-8 text-center">
          <p>Facilities data coming soon.</p>
        </div>
      )}
    </main>
  )
}
