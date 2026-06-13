import { prisma } from '@/lib/prisma'

type HoursMap = Record<string, string | null>
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

function getLibraryOpenStatus(hoursJson: string | null): { todayHours: string | null; isOpen: boolean } | null {
  if (!hoursJson) return null
  try {
    const hours: HoursMap = JSON.parse(hoursJson)
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Melbourne' }))
    const dayKey = DAYS[now.getDay()]
    const todayHours = hours[dayKey] ?? null
    if (!todayHours) return { todayHours: null, isOpen: false }
    const [open, close] = todayHours.split('-').map(t => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + (m ?? 0)
    })
    const nowMins = now.getHours() * 60 + now.getMinutes()
    return { todayHours, isOpen: nowMins >= open && nowMins < close }
  } catch {
    return null
  }
}
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EventCard } from '@/components/EventCard'
import { RegionBadge } from '@/components/RegionBadge'
import { FavoriteButton } from '@/components/FavoriteButton'
import { FavoriteLibraryButton } from '@/components/FavoriteLibraryButton'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

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

  // Non-VIC councils: simplified layout (no events/libraries tabs)
  if (council.state !== 'VIC') {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-(--color-primary)">{council.name}</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{council.state}</span>
            </div>
            <p className="text-sm text-gray-400">Council information</p>
          </div>
          <Link href="/councils" className="text-sm text-gray-400 hover:text-gray-600">← All Councils</Link>
        </div>

        {/* Library events card */}
        {council.libraryUrl && (
          <a
            href={council.libraryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-purple-600 text-white rounded-2xl px-6 py-5 mb-6 hover:bg-purple-700 transition-colors group"
          >
            <div>
              <p className="font-semibold text-lg">📚 Library Events &amp; Programs</p>
              <p className="text-purple-200 text-sm mt-0.5">Browse events, book clubs, children&apos;s programs and more</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}

        {/* Basic info */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {council.population != null && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Population</p>
              <p className="text-xl font-bold text-(--color-primary)">{council.population.toLocaleString()}</p>
            </div>
          )}
          {council.areaSqKm != null && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Area</p>
              <p className="text-xl font-bold text-(--color-primary)">{council.areaSqKm.toLocaleString()} km²</p>
            </div>
          )}
          {council.website && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Website</p>
              <a href={council.website} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all">
                Visit council website ↗
              </a>
            </div>
          )}
        </div>

        {/* Demographics (if stats exist) */}
        {council.stats && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Demographics (ABS Census 2021)</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {council.stats.medianAge != null && (
                <div><span className="text-gray-400">Median age:</span> <strong>{council.stats.medianAge}</strong></div>
              )}
              {council.stats.overseasBornPct != null && (
                <div><span className="text-gray-400">Born overseas:</span> <strong>{council.stats.overseasBornPct.toFixed(1)}%</strong></div>
              )}
              {council.stats.medianHouseholdIncome != null && (
                <div><span className="text-gray-400">Median household income:</span> <strong>${council.stats.medianHouseholdIncome.toLocaleString()}/wk</strong></div>
              )}
            </div>
          </div>
        )}
      </main>
    )
  }

  const density =
    council.population && council.areaSqKm
      ? Math.round(council.population / council.areaSqKm)
      : null

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'events', label: `Events (${council.events.length})` },
    { key: 'libraries', label: `Libraries${council.libraries.length > 0 ? ` (${council.libraries.length})` : ''}` },
    { key: 'new-resident', label: '🏠 New Resident' },
  ]

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/councils" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Councils
        </Link>
        <Link href={`/?council=${council.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 animate-pulse hover:animate-none transition-all">
          <span>🗺️</span> View on map
        </Link>
      </div>
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

      {/* Tabs — fixed width, no layout shift */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {TABS.map(t => (
          <a
            key={t.key}
            href={`/councils/${council.id}?tab=${t.key}`}
            className={`px-4 py-2 text-sm -mb-px border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'border-(--color-primary) text-(--color-primary) font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-sm text-gray-500 mb-4">
        {tab === 'overview' && 'Population, age & gender breakdown, overseas-born %, income, and top languages — sourced from ABS 2021 Census.'}
        {tab === 'events' && 'Upcoming community events from this council\'s library. Click any event to book or get more details.'}
        {tab === 'libraries' && 'All library branches in this council — opening hours, address, and phone. Click a branch to visit its website.'}
        {tab === 'new-resident' && 'Essential info for people new to this council: library card, bin colours, GP, kinder enrolment, hard rubbish, and voter registration.'}
      </p>

      {/* Tab content — fixed min-height prevents layout shift */}
      <div className="min-h-96 w-full">

        {tab === 'overview' && (
          <div className="w-full space-y-4">
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
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h2 className="font-semibold mb-3">Gender distribution</h2>
                  <div className="flex rounded-full overflow-hidden h-4">
                    <div className="bg-blue-400 h-full" style={{ width: `${council.stats.malePercent ?? 50}%` }} />
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

                {/* Demographics — overseas born + income + languages */}
                {(council.stats.overseasBornPct != null || council.stats.topLanguagesJson) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold mb-4">Demographics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Overseas born */}
                      {council.stats.overseasBornPct != null && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Born overseas</p>
                          <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-(--color-primary)">{council.stats.overseasBornPct.toFixed(1)}%</span>
                            <span className="text-sm text-gray-400 mb-1">of residents</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-purple-400" style={{ width: `${council.stats.overseasBornPct}%` }} />
                          </div>
                          {council.stats.medianHouseholdIncome && (
                            <p className="text-sm text-gray-500 mt-3">
                              Median household income: <span className="font-semibold text-gray-700">${council.stats.medianHouseholdIncome.toLocaleString()}/wk</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Top languages */}
                      {council.stats.topLanguagesJson && (() => {
                        let langs: { language: string; pct: number }[] = []
                        try { langs = JSON.parse(council.stats.topLanguagesJson) } catch { return null }
                        if (!langs.length) return null
                        return (
                          <div>
                            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Top languages at home</p>
                            <div className="space-y-2">
                              {langs.map(({ language, pct }) => (
                                <div key={language}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">{language}</span>
                                    <span className="text-gray-500">{pct.toFixed(1)}%</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${Math.min(pct * 5, 100)}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Source: ABS 2021 Census</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'events' && (
          <div className="w-full space-y-5">
            {/* Top row: external link banner + quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {council.libraryUrl && (
                <a
                  href={council.libraryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:col-span-2 flex items-center justify-between bg-(--color-primary) text-white rounded-2xl px-6 py-5 hover:opacity-90 transition-opacity group"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-base">View all events on the library website</p>
                    <p className="text-white/70 text-sm mt-0.5 truncate">{council.libraryUrl}</p>
                  </div>
                  <span className="text-2xl ml-4 shrink-0 group-hover:translate-x-1 transition-transform">→</span>
                </a>
              )}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-center">
                <p className="text-3xl font-bold text-(--color-primary)">{council.events.length}</p>
                <p className="text-sm text-gray-500 mt-1">Events in our database</p>
                {council.libraryPlatform && (
                  <p className="text-xs text-gray-400 mt-2 capitalize">Platform: {council.libraryPlatform}</p>
                )}
              </div>
            </div>

            {/* Scraped events list */}
            {council.events.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 w-full">
                <p className="text-gray-500 font-medium">No upcoming events in our database yet</p>
                <p className="text-gray-400 text-sm mt-1">Visit the library website above to see current events</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                  Upcoming events ({council.events.length})
                </p>
                <div className="space-y-3 w-full">
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
                <Link href={`/events?council=${council.id}`} className="text-sm text-(--color-primary) underline block">
                  View all events for {council.name} →
                </Link>
              </>
            )}
          </div>
        )}

        {tab === 'libraries' && (
          <div className="w-full space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {council.libraries.length > 0
                  ? `${council.libraries.length} librar${council.libraries.length === 1 ? 'y' : 'ies'} in ${council.name}`
                  : `No library data yet for ${council.name}`}
              </p>
              {council.libraryUrl && (
                <a href={council.libraryUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-(--color-primary) hover:underline">
                  All library info →
                </a>
              )}
            </div>

            {council.libraries.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <p className="text-gray-500 font-medium">Library branches coming soon</p>
                {council.libraryUrl && (
                  <a href={council.libraryUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-(--color-primary) underline mt-2 block">
                    Visit the library website
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {council.libraries.map(lib => {
                  const openStatus = getLibraryOpenStatus(lib.hoursJson ?? null)
                  const CardContent = (
                    <>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-(--color-primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 leading-snug">{lib.name}</p>
                          {lib.suburb && <p className="text-xs text-gray-400 mt-0.5">{lib.suburb}</p>}
                        </div>
                        <FavoriteLibraryButton libraryId={lib.id} className="text-lg text-amber-400 shrink-0" />
                      </div>
                      {lib.address && (
                        <p className="text-sm text-gray-500 flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {lib.address}{lib.suburb ? `, ${lib.suburb}` : ''}
                        </p>
                      )}
                      {lib.phone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                          <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {lib.phone}
                        </p>
                      )}
                      {openStatus ? (
                        <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${openStatus.isOpen ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${openStatus.isOpen ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {openStatus.todayHours
                            ? `Today ${openStatus.todayHours} · ${openStatus.isOpen ? 'Open now' : 'Closed'}`
                            : 'Closed today'}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-2">Hours unknown</p>
                      )}
                      {lib.url && (
                        <p className="text-xs font-medium text-(--color-primary) mt-3">View details →</p>
                      )}
                    </>
                  )
                  return lib.url ? (
                    <a
                      key={lib.id}
                      href={lib.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-(--color-primary)/30 transition-all block"
                    >
                      {CardContent}
                    </a>
                  ) : (
                    <div key={lib.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      {CardContent}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'new-resident' && (
          <div className="w-full space-y-6">
            <p className="text-sm text-gray-500">Essential information for new residents of {council.name}.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Library card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-xl">📚</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Get a Library Card</h3>
                    <p className="text-xs text-green-700 font-medium mt-0.5">100% Free</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Bring your ID + proof of address. No citizenship required. Access books, eBooks, events, and internet — all free.</p>
                {council.libraryCardUrl ? (
                  <a href={council.libraryCardUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-(--color-primary) hover:underline font-medium">Join online →</a>
                ) : council.libraryUrl ? (
                  <a href={council.libraryUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-(--color-primary) hover:underline font-medium">Library website →</a>
                ) : null}
              </div>

              {/* Bins */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-xl">🗑️</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Bin Colours</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Council kerbside collection</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shrink-0" /> Red lid — General waste</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" /> Yellow lid — Recycling (paper, plastic, metal)</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-lime-400 shrink-0" /> Lime green lid — Food &amp; garden organics (FOGO)</li>
                  {council.id === 'ballarat' && (
                    <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" /> Purple lid — Glass only</li>
                  )}
                  {council.id === 'bendigo' && (
                    <li className="text-xs text-gray-400 mt-1">Note: Bendigo is transitioning — some households may have older red/dark-green or blue/yellow bins.</li>
                  )}
                  {council.id === 'geelong' && (
                    <li className="text-xs text-gray-400 mt-1">Note: Geelong is rolling out lime green lids — some older bins may still have dark green.</li>
                  )}
                </ul>
              </div>

              {/* GP / Medicare */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0 text-xl">🏥</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Find a GP</h3>
                    <p className="text-xs text-gray-400 mt-0.5">General practitioner (family doctor)</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Register for Medicare first. Many GPs bulk bill — meaning your appointment costs nothing out of pocket.</p>
                <a href="https://www.healthdirect.gov.au/gp-clinics" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-(--color-primary) hover:underline font-medium">Find bulk billing GPs →</a>
              </div>

              {/* Kindergarten */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0 text-xl">🧒</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Kindergarten Enrolment</h3>
                    <p className="text-xs text-orange-600 font-medium mt-0.5">Enrol early — waitlists are long</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">3-year-old and 4-year-old kinder is free or subsidised in Victoria. Register with your council as soon as possible — some waitlists open at birth.</p>
                {council.kindergartenUrl ? (
                  <a href={council.kindergartenUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-(--color-primary) hover:underline font-medium">Enrol at {council.name} →</a>
                ) : (
                  <a href={`${council.website ?? '#'}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-(--color-primary) hover:underline font-medium">Council website →</a>
                )}
              </div>

              {/* Hard rubbish */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-xl">🚚</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Hard Rubbish Collection</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Bulky waste pickup</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Large items (furniture, appliances, mattresses) are collected kerbside once or twice a year — free of charge. Check your council's schedule or booking page.</p>
                {council.hardRubbishUrl ? (
                  <a href={council.hardRubbishUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-(--color-primary) hover:underline font-medium">View schedule / book →</a>
                ) : (
                  <a href={`${council.website ?? '#'}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-(--color-primary) hover:underline font-medium">Council website →</a>
                )}
              </div>

              {/* Voting */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 text-xl">🗳️</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Enrol to Vote</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Required for Australian citizens</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Voting is compulsory for Australian citizens 18+. Enrol or update your address at the AEC — takes 5 minutes online.</p>
                <a href="https://www.aec.gov.au/enrol/" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-(--color-primary) hover:underline font-medium">Enrol at AEC →</a>
              </div>
            </div>

            {/* Sources */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-400 mb-1">Sources</p>
              <ul className="text-xs text-gray-400 space-y-0.5">
                {council.libraryCardUrl && <li><a href={council.libraryCardUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{council.name} — Library card signup</a></li>}
                {council.kindergartenUrl && <li><a href={council.kindergartenUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{council.name} — Kindergarten registration</a></li>}
                {council.hardRubbishUrl && <li><a href={council.hardRubbishUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{council.name} — Hard rubbish collection</a></li>}
                <li><a href="https://www.aec.gov.au/enrol/" target="_blank" rel="noopener noreferrer" className="hover:underline">Australian Electoral Commission — Enrol to vote</a></li>
                <li><a href="https://www.healthdirect.gov.au/gp-clinics" target="_blank" rel="noopener noreferrer" className="hover:underline">Healthdirect — Find a GP</a></li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
