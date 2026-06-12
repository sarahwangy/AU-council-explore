import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { CouncilCard } from '@/components/CouncilCard'
import { NonVicCouncilCard } from '@/components/NonVicCouncilCard'
import { CouncilSearch } from './CouncilSearch'
import { StateTabs } from '@/components/StateTabs'
import { Suspense } from 'react'

const VIC_REGION_KEYS = ['all', 'inner', 'eastern', 'southern', 'northern', 'western', 'outer', 'regional'] as const
const NSW_REGION_KEYS = ['all', 'sydney-inner', 'sydney-north', 'sydney-west', 'sydney-southwest', 'nsw-regional'] as const

const NSW_REGION_LABELS: Record<string, string> = {
  'sydney-inner': 'Inner Sydney',
  'sydney-north': 'North Sydney',
  'sydney-west': 'Western Sydney',
  'sydney-southwest': 'South-West Sydney',
  'nsw-regional': 'NSW Regional',
}

interface Props {
  searchParams: Promise<{ region?: string; q?: string; state?: string }>
}

export default async function CouncilsPage({ searchParams }: Props) {
  const { region: regionParam, q, state: stateParam } = await searchParams
  const t = await getTranslations('councils')
  const activeState = stateParam ?? 'VIC'

  const region = regionParam && regionParam !== 'all' ? regionParam : undefined

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

  const filtered = q
    ? councils.filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    : councils

  const isVic = activeState === 'VIC'
  const regionKeys = isVic ? VIC_REGION_KEYS : NSW_REGION_KEYS

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-(--color-primary) mb-6">{t('heading')}</h1>

      {/* State tabs */}
      <Suspense fallback={null}>
        <StateTabs basePath="/councils" preserveParams={['region', 'q']} />
      </Suspense>

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
              : r === 'all' ? 'All' : (NSW_REGION_LABELS[r] ?? r)}
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
