import { prisma } from '@/lib/prisma'
import { CouncilCard } from '@/components/CouncilCard'

const REGIONS = ['all', 'inner', 'eastern', 'southern', 'northern', 'western', 'outer']
const REGION_LABELS: Record<string, string> = {
  all: 'All', inner: 'Inner', eastern: 'Eastern',
  southern: 'Southern', northern: 'Northern', western: 'Western', outer: 'Outer',
}

interface Props {
  searchParams: Promise<{ region?: string; q?: string }>
}

export default async function CouncilsPage({ searchParams }: Props) {
  const { region: regionParam, q } = await searchParams
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
      <h1 className="text-2xl font-bold text-(--color-primary) mb-6">Melbourne Councils</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {REGIONS.map(r => (
          <a
            key={r}
            href={`/councils?region=${r}`}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              (regionParam ?? 'all') === r
                ? 'bg-(--color-primary) text-white border-transparent'
                : 'border-gray-300 hover:border-(--color-primary)'
            }`}
            style={
              (regionParam ?? 'all') === r
                ? { backgroundColor: 'var(--color-primary)' }
                : {}
            }
          >
            {REGION_LABELS[r]}
          </a>
        ))}
      </div>

      <form method="get" action="/councils" className="mb-6">
        {region && <input type="hidden" name="region" value={region} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search councils..."
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
        />
      </form>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} councils</p>

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
        <p className="text-center text-gray-400 py-16">No councils found.</p>
      )}
    </main>
  )
}
