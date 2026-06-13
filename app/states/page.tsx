import Link from 'next/link'
import { prisma } from '@/lib/prisma'

const STATE_INFO = [
  { abbr: 'VIC', name: 'Victoria', capital: 'Melbourne', areaSqKm: 227444, population: 6680000, emoji: '🏙️' },
  { abbr: 'NSW', name: 'New South Wales', capital: 'Sydney', areaSqKm: 800642, population: 8166000, emoji: '🌉' },
  { abbr: 'QLD', name: 'Queensland', capital: 'Brisbane', areaSqKm: 1852642, population: 5194000, emoji: '☀️' },
  { abbr: 'WA', name: 'Western Australia', capital: 'Perth', areaSqKm: 2529875, population: 2779000, emoji: '🌊' },
  { abbr: 'SA', name: 'South Australia', capital: 'Adelaide', areaSqKm: 983482, population: 1820000, emoji: '🍷' },
  { abbr: 'TAS', name: 'Tasmania', capital: 'Hobart', areaSqKm: 68401, population: 567000, emoji: '🌲' },
  { abbr: 'ACT', name: 'Australian Capital Territory', capital: 'Canberra', areaSqKm: 2358, population: 456700, emoji: '🏛️' },
  { abbr: 'NT', name: 'Northern Territory', capital: 'Darwin', areaSqKm: 1349129, population: 252000, emoji: '🦘' },
]

function fmtPop(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  return (n / 1000).toFixed(0) + 'K'
}

function fmtArea(n: number): string {
  return n.toLocaleString('en-AU') + ' km²'
}

export default async function StatesPage() {
  const councilCounts = await prisma.council.groupBy({ by: ['state'], _count: { id: true } })
  const libRows = await prisma.library.findMany({ select: { id: true, council: { select: { state: true } } } })

  const councilCountByState: Record<string, number> = {}
  for (const row of councilCounts) {
    councilCountByState[row.state] = row._count.id
  }

  const libCountByState: Record<string, number> = {}
  for (const row of libRows) {
    const state = row.council.state
    libCountByState[state] = (libCountByState[state] ?? 0) + 1
  }

  const totalCouncils = Object.values(councilCountByState).reduce((a, b) => a + b, 0)
  const totalLibraries = libRows.length

  const sorted = [...STATE_INFO].sort((a, b) => b.population - a.population)

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-primary) mb-2">Australia by State</h1>
        <p className="text-(--color-muted) text-base">
          {totalCouncils} councils and {totalLibraries} libraries recorded across Australia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sorted.map((state) => {
          const councils = councilCountByState[state.abbr] ?? 0
          const libraries = libCountByState[state.abbr] ?? 0

          return (
            <div
              key={state.abbr}
              className="rounded-2xl border border-(--color-border) bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" aria-hidden="true">{state.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-(--color-primary) leading-tight">{state.name}</h2>
                    <span className="inline-block mt-1 text-xs font-medium bg-(--color-accent)/10 text-(--color-accent) px-2 py-0.5 rounded-full">
                      {state.capital}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-(--color-surface) px-4 py-3">
                    <p className="text-xs text-(--color-muted) uppercase tracking-wide mb-1">Population</p>
                    <p className="text-lg font-semibold text-(--color-primary)">{fmtPop(state.population)}</p>
                  </div>
                  <div className="rounded-xl bg-(--color-surface) px-4 py-3">
                    <p className="text-xs text-(--color-muted) uppercase tracking-wide mb-1">Area</p>
                    <p className="text-lg font-semibold text-(--color-primary)">{fmtArea(state.areaSqKm)}</p>
                  </div>
                  <div className="rounded-xl bg-(--color-surface) px-4 py-3">
                    <p className="text-xs text-(--color-muted) uppercase tracking-wide mb-1">Councils</p>
                    <p className="text-lg font-semibold text-(--color-primary)">
                      {councils > 0 ? councils : '—'}
                    </p>
                    {councils > 0 && (
                      <p className="text-xs text-(--color-muted)">in system</p>
                    )}
                  </div>
                  <div className="rounded-xl bg-(--color-surface) px-4 py-3">
                    <p className="text-xs text-(--color-muted) uppercase tracking-wide mb-1">Libraries</p>
                    <p className="text-lg font-semibold text-(--color-primary)">
                      {libraries > 0 ? libraries : '—'}
                    </p>
                    {libraries > 0 && (
                      <p className="text-xs text-(--color-muted)">recorded</p>
                    )}
                  </div>
                </div>
              </div>

              {councils > 0 && (
                <div className="flex border-t border-(--color-border)">
                  <Link
                    href={`/councils?state=${state.abbr}`}
                    className="flex-1 text-center py-3 text-sm font-medium text-(--color-accent) hover:bg-(--color-accent)/5 transition-colors"
                  >
                    View Councils
                  </Link>
                  <div className="w-px bg-(--color-border)" />
                  <Link
                    href={`/libraries?state=${state.abbr}`}
                    className="flex-1 text-center py-3 text-sm font-medium text-(--color-accent) hover:bg-(--color-accent)/5 transition-colors"
                  >
                    View Libraries
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
