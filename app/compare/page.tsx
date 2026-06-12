import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ a?: string; b?: string; c?: string }>
}

const REGION_COLORS: Record<string, string> = {
  inner: 'bg-purple-100 text-purple-700',
  eastern: 'bg-blue-100 text-blue-700',
  southern: 'bg-green-100 text-green-700',
  northern: 'bg-orange-100 text-orange-700',
  western: 'bg-red-100 text-red-700',
  outer: 'bg-gray-100 text-gray-600',
}

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams
  const slugs = [sp.a, sp.b, sp.c].filter(Boolean) as string[]

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [allCouncils, selected] = await Promise.all([
    prisma.council.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    slugs.length > 0
      ? prisma.council.findMany({
          where: { id: { in: slugs } },
          include: {
            stats: true,
            _count: {
              select: {
                events: { where: { startAt: { gte: now } } },
              },
            },
          },
        })
      : Promise.resolve([]),
  ])

  // Keep order matching slugs selection
  const ordered = slugs.map(s => selected.find(c => c.id === s)).filter(Boolean) as typeof selected

  const maxPop = Math.max(...ordered.map(c => c.population ?? 0), 1)
  const maxEvents = Math.max(...ordered.map(c => c._count.events), 1)

  const PALETTE = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500']
  const PALETTE_LIGHT = ['bg-blue-100', 'bg-emerald-100', 'bg-violet-100']
  const PALETTE_TEXT = ['text-blue-700', 'text-emerald-700', 'text-violet-700']

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-primary) mb-1">Compare Councils</h1>
        <p className="text-gray-400 text-sm">Select up to 3 councils to compare side by side</p>
      </div>

      {/* Selector */}
      <form method="get" action="/compare" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Choose councils</p>
        <div className="flex flex-wrap gap-3 items-end">
          {(['a', 'b', 'c'] as const).map((key, i) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Council {i + 1}</label>
              <select
                name={key}
                title={`Council ${i + 1}`}
                defaultValue={sp[key] ?? ''}
                className={`border rounded-xl px-3 py-2 text-sm min-w-44 ${
                  sp[key] ? `border-transparent ${PALETTE_LIGHT[i]} ${PALETTE_TEXT[i]} font-medium` : 'border-gray-200 bg-gray-50'
                }`}
              >
                <option value="">— Select —</option>
                {allCouncils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ))}
          <button type="submit" className="px-5 py-2 text-sm font-semibold text-white rounded-xl bg-(--color-primary) hover:opacity-90 transition-opacity">
            Compare
          </button>
          {slugs.length > 0 && (
            <a href="/compare" className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-xl border border-gray-200">
              Clear
            </a>
          )}
        </div>
      </form>

      {ordered.length < 2 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">⚖️</div>
          <p className="text-gray-500 font-medium">Select at least 2 councils to compare</p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Council header cards */}
          <div className={`grid gap-4 ${ordered.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {ordered.map((c, i) => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className={`w-3 h-3 rounded-full ${PALETTE[i]} mb-3`} />
                <Link href={`/councils/${c.id}`} className="font-bold text-lg text-(--color-primary) hover:underline block">
                  {c.name}
                </Link>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${REGION_COLORS[c.region] ?? 'bg-gray-100 text-gray-500'}`}>
                  {c.region}
                </span>
              </div>
            ))}
          </div>

          {/* Population bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Population</h2>
            <div className="space-y-3">
              {ordered.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-36 truncate">{c.name}</span>
                  <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${PALETTE[i]} rounded-lg transition-all`}
                      style={{ width: `${((c.population ?? 0) / maxPop) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-24 text-right">
                    {c.population?.toLocaleString() ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div className={`grid gap-4 ${ordered.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {ordered.map((c, i) => (
              <div key={c.id} className={`rounded-2xl border p-5 ${PALETTE_LIGHT[i]} border-transparent`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-4 ${PALETTE_TEXT[i]}`}>
                  {c.name}
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Area', value: c.areaSqKm ? `${c.areaSqKm.toFixed(0)} km²` : '—' },
                    { label: 'Density', value: c.population && c.areaSqKm ? `${Math.round(c.population / c.areaSqKm)}/km²` : '—' },
                    { label: 'Median age', value: c.stats?.medianAge ? `${c.stats.medianAge} yrs` : '—' },
                    { label: 'Upcoming events', value: String(c._count.events) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-baseline">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-sm font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Age distribution comparison */}
          {ordered.some(c => c.stats?.agePct65plus != null) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Age Distribution (%)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-400 font-normal text-xs">Age group</th>
                      {ordered.map((c, i) => (
                        <th key={c.id} className={`text-right py-2 px-3 text-xs font-semibold ${PALETTE_TEXT[i]}`}>
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: '0–4 yrs', key: 'agePct0to4' as const },
                      { label: '5–14 yrs', key: 'agePct5to14' as const },
                      { label: '15–19 yrs', key: 'agePct15to19' as const },
                      { label: '20–39 yrs', key: 'agePct20to39' as const },
                      { label: '40–64 yrs', key: 'agePct40to64' as const },
                      { label: '65+ yrs', key: 'agePct65plus' as const },
                    ].map(({ label, key }) => (
                      <tr key={key} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-gray-600">{label}</td>
                        {ordered.map(c => (
                          <td key={c.id} className="py-2 px-3 text-right font-medium">
                            {c.stats?.[key] != null ? `${c.stats[key]!.toFixed(1)}%` : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">Source: ABS 2021 Census</p>
            </div>
          )}

        </div>
      )}
    </main>
  )
}
