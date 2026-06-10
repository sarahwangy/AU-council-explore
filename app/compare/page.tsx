import { prisma } from '@/lib/prisma'

interface Props {
  searchParams: Promise<{ a?: string; b?: string; c?: string }>
}

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams
  const slugs = [sp.a, sp.b, sp.c].filter(Boolean) as string[]

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [allCouncils, selected] = await Promise.all([
    prisma.council.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    slugs.length > 0
      ? prisma.council.findMany({
          where: { id: { in: slugs } },
          include: {
            stats: true,
            _count: {
              select: {
                libraries: true,
                events: { where: { startAt: { gte: monthStart } } },
              },
            },
          },
        })
      : Promise.resolve([]),
  ])

  type SelectedCouncil = typeof selected[0]

  const DIMENSIONS: { key: string; label: string; fn: (c: SelectedCouncil) => string }[] = [
    { key: 'population', label: 'Population', fn: c => c.population?.toLocaleString() ?? '—' },
    { key: 'area', label: 'Area (km²)', fn: c => c.areaSqKm?.toFixed(1) ?? '—' },
    { key: 'density', label: 'Density (/km²)', fn: c => c.population && c.areaSqKm ? String(Math.round(c.population / c.areaSqKm)) : '—' },
    { key: 'libraries', label: 'Libraries', fn: c => String(c._count.libraries) },
    { key: 'events', label: 'Events this month', fn: c => String(c._count.events) },
    { key: 'medianAge', label: 'Median age', fn: c => c.stats?.medianAge ? `${c.stats.medianAge}` : '—' },
  ]

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
        Compare Councils
      </h1>

      <form method="get" action="/compare" className="flex flex-wrap gap-3 mb-8">
        {(['a', 'b', 'c'] as const).map((key, i) => (
          <select
            key={key}
            name={key}
            defaultValue={sp[key] ?? ''}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Council {i + 1}</option>
            {allCouncils.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ))}
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white rounded-lg"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Compare
        </button>
      </form>

      {selected.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 text-gray-500 font-normal">Metric</th>
                {selected.map(c => (
                  <th key={c.id} className="text-center py-2 px-4 font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map(d => (
                <tr key={d.key} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-600">{d.label}</td>
                  {selected.map(c => (
                    <td key={c.id} className="py-3 px-4 text-center font-medium">
                      {d.fn(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">Select at least 2 councils to compare.</p>
      )}
    </main>
  )
}
