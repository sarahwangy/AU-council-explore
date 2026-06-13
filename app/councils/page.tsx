import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { CouncilCard } from '@/components/CouncilCard'
import { NonVicCouncilCard } from '@/components/NonVicCouncilCard'
import { CouncilSearch } from './CouncilSearch'
import { StateTabs } from '@/components/StateTabs'
import { Suspense } from 'react'

const STATE_NAMES: Record<string, string> = {
  VIC: 'Victorian', NSW: 'New South Wales', QLD: 'Queensland',
  SA: 'South Australian', WA: 'Western Australian', TAS: 'Tasmanian',
  ACT: 'ACT', NT: 'Northern Territory',
}

const VIC_REGION_KEYS = ['all', 'inner', 'eastern', 'southern', 'northern', 'western', 'outer', 'regional'] as const

const STATE_REGION_KEYS: Record<string, string[]> = {
  NSW: ['all', 'sydney-inner', 'sydney-north', 'sydney-west', 'sydney-southwest', 'nsw-regional'],
  QLD: ['all', 'brisbane-north', 'brisbane-south', 'gold-coast', 'sunshine-coast', 'qld-regional'],
  SA:  ['all', 'adelaide-metro', 'adelaide-hills', 'sa-regional'],
  WA:  ['all', 'perth-metro', 'perth-south', 'wa-regional'],
  TAS: ['all', 'hobart-metro', 'launceston', 'tas-regional'],
  ACT: ['all'],
  NT:  ['all', 'darwin-metro', 'alice-springs', 'nt-regional'],
}

const STATE_REGION_LABELS: Record<string, Record<string, string>> = {
  NSW: { 'sydney-inner': 'Inner Sydney', 'sydney-north': 'North Sydney', 'sydney-west': 'Western Sydney', 'sydney-southwest': 'South-West Sydney', 'nsw-regional': 'NSW Regional' },
  QLD: { 'brisbane-north': 'Brisbane North', 'brisbane-south': 'Brisbane South', 'gold-coast': 'Gold Coast', 'sunshine-coast': 'Sunshine Coast', 'qld-regional': 'QLD Regional' },
  SA:  { 'adelaide-metro': 'Adelaide Metro', 'adelaide-hills': 'Adelaide Hills', 'sa-regional': 'SA Regional' },
  WA:  { 'perth-metro': 'Perth Metro', 'perth-south': 'Perth South', 'wa-regional': 'WA Regional' },
  TAS: { 'hobart-metro': 'Hobart Metro', 'launceston': 'Launceston', 'tas-regional': 'TAS Regional' },
  ACT: {},
  NT:  { 'darwin-metro': 'Darwin Metro', 'alice-springs': 'Alice Springs', 'nt-regional': 'NT Regional' },
}

interface Props {
  searchParams: Promise<{ region?: string; q?: string; state?: string }>
}

export default async function CouncilsPage({ searchParams }: Props) {
  const { region: regionParam, q, state: stateParam } = await searchParams
  const t = await getTranslations('councils')
  const activeState = stateParam ?? 'VIC'

  const region = regionParam && regionParam !== 'all' ? regionParam : undefined

  // Fetch filtered councils (displayed cards)
  const councils = await prisma.council.findMany({
    where: {
      state: activeState,
      ...(region ? { region } : {}),
    },
    include: {
      stats: true,
      _count: {
        select: {
          libraries: true,
          events: { where: { startAt: { gte: new Date() } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Fetch all-state counts for stats summary (unfiltered)
  const allCouncils = await prisma.council.findMany({
    where: { state: activeState },
    include: { _count: { select: { libraries: true } } },
  })
  const totalCouncils = allCouncils.length
  const totalLibraries = allCouncils.reduce((s, c) => s + c._count.libraries, 0)

  const filtered = q
    ? councils.filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    : councils

  const isVic = activeState === 'VIC'
  const regionKeys = isVic ? [...VIC_REGION_KEYS] : (STATE_REGION_KEYS[activeState] ?? ['all'])
  const regionLabels = STATE_REGION_LABELS[activeState] ?? {}
  const stateName = STATE_NAMES[activeState] ?? activeState

  // Per-region counts for non-all views
  const regionCounts: Record<string, { councils: number; libraries: number }> = {}
  for (const c of allCouncils) {
    if (!regionCounts[c.region]) regionCounts[c.region] = { councils: 0, libraries: 0 }
    regionCounts[c.region].councils++
    regionCounts[c.region].libraries += c._count.libraries
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-(--color-primary) mb-1">{stateName} Councils</h1>
      <p className="text-sm text-gray-500 mb-5">
        {totalCouncils} councils{totalLibraries > 0 ? ` · ${totalLibraries} libraries` : ''}
      </p>

      {/* State tabs */}
      <Suspense fallback={null}>
        <StateTabs basePath="/councils" preserveParams={['q']} />
      </Suspense>

      {/* Region stats summary */}
      {regionKeys.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
          {regionKeys.filter(r => r !== 'all').map(r => {
            const label = isVic ? t(`regions.${r}`) : (regionLabels[r] ?? r)
            const counts = regionCounts[r]
            if (!counts) return null
            return (
              <a
                key={r}
                href={`/councils?state=${activeState}&region=${r}`}
                className={`rounded-xl border px-4 py-3 hover:border-(--color-primary)/40 transition-colors ${
                  (regionParam ?? '') === r
                    ? 'bg-(--color-primary)/5 border-(--color-primary)/40'
                    : 'bg-white border-gray-200'
                }`}
              >
                <p className="text-xs text-gray-400 truncate">{label}</p>
                <p className="text-lg font-bold text-(--color-primary) mt-0.5">{counts.councils}</p>
                <p className="text-xs text-gray-400">
                  {counts.councils === 1 ? 'council' : 'councils'}
                  {counts.libraries > 0 ? ` · ${counts.libraries} lib${counts.libraries === 1 ? '' : 's'}` : ''}
                </p>
              </a>
            )
          })}
        </div>
      )}

      {/* Region filter (per state) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {regionKeys.map(r => (
          <a
            key={r}
            href={`/councils?state=${activeState}&region=${r}`}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              (regionParam ?? 'all') === r
                ? 'bg-(--color-primary) text-white border-transparent'
                : 'border-gray-300 hover:border-(--color-primary)'
            }`}
          >
            {isVic
              ? t(`regions.${r}`)
              : r === 'all' ? 'All' : (regionLabels[r] ?? r)}
          </a>
        ))}
      </div>

      <CouncilSearch
        councils={councils.map(c => ({ id: c.id, name: c.name, region: c.region }))}
        defaultValue={q}
        region={region}
        placeholder={t('search')}
      />

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm mt-8">No councils found.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {filtered.map(c =>
          isVic ? (
            <CouncilCard
              key={c.id}
              id={c.id}
              name={c.name}
              region={c.region}
              population={c.population}
              libraryCount={c._count.libraries}
              eventCount={c._count.events}
            />
          ) : (
            <NonVicCouncilCard
              key={c.id}
              id={c.id}
              name={c.name}
              state={c.state}
              population={c.population}
              areaSqKm={c.areaSqKm}
              libraryUrl={c.libraryUrl}
              website={c.website}
            />
          )
        )}
      </div>
    </main>
  )
}
