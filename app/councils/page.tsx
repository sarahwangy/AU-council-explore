import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { CouncilCard } from '@/components/CouncilCard'
import { CouncilSearch } from './CouncilSearch'

const REGION_KEYS = ['all', 'inner', 'eastern', 'southern', 'northern', 'western', 'outer', 'regional'] as const

interface Props {
  searchParams: Promise<{ region?: string; q?: string }>
}

export default async function CouncilsPage({ searchParams }: Props) {
  const { region: regionParam, q } = await searchParams
  const t = await getTranslations('councils')

  const region = regionParam && regionParam !== 'all' ? regionParam : undefined

  const councils = await prisma.council.findMany({
    where: region ? { region } : undefined,
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

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-(--color-primary) mb-6">{t('heading')}</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {REGION_KEYS.map(r => (
          <a
            key={r}
            href={`/councils?region=${r}`}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              (regionParam ?? 'all') === r
                ? 'bg-(--color-primary) text-white border-transparent'
                : 'border-gray-300 hover:border-(--color-primary)'
            }`}
          >
            {t(`regions.${r}`)}
          </a>
        ))}
      </div>

      <CouncilSearch
        councils={councils.map(c => ({ id: c.id, name: c.name, region: c.region }))}
        defaultValue={q}
        region={region}
        placeholder={t('search')}
      />

      <p className="text-sm text-gray-500 mb-4">{t('count', { count: filtered.length })}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <CouncilCard
            key={c.id}
            id={c.id}
            name={c.name}
            region={c.region}
            population={c.population}
            libraryCount={c._count.libraries}
            eventCount={c._count.events}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-16">{t('empty')}</p>
      )}
    </main>
  )
}
