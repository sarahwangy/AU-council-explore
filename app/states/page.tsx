import { prisma } from '@/lib/prisma'
import { StatesView } from './StatesView'
import type { StateRow } from './StatesView'

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

export default async function StatesPage() {
  const councilCounts = await prisma.council.groupBy({ by: ['state'], _count: { id: true } })
  const libRows = await prisma.library.findMany({ select: { id: true, council: { select: { state: true } } } })

  const councilCountByState: Record<string, number> = {}
  for (const row of councilCounts) {
    councilCountByState[row.state] = row._count.id
  }

  const libCountByState: Record<string, number> = {}
  for (const row of libRows) {
    libCountByState[row.council.state] = (libCountByState[row.council.state] ?? 0) + 1
  }

  const totalCouncils = Object.values(councilCountByState).reduce((a, b) => a + b, 0)
  const totalLibraries = libRows.length

  const states: StateRow[] = STATE_INFO.map(s => ({
    ...s,
    councils: councilCountByState[s.abbr] ?? 0,
    libraries: libCountByState[s.abbr] ?? 0,
  }))

  return (
    <StatesView
      states={states}
      totalCouncils={totalCouncils}
      totalLibraries={totalLibraries}
    />
  )
}
