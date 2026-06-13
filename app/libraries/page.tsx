import { prisma } from '@/lib/prisma'
import { NearbySearch } from './NearbySearch'
import { LibraryList } from './LibraryList'
import { StateTabs } from '@/components/StateTabs'
import { Suspense } from 'react'

async function NonVicLibraryNotice({ state }: { state: string }) {
  const councils = await prisma.council.findMany({
    where: { state },
    select: { id: true, name: true, libraryUrl: true },
    orderBy: { name: 'asc' },
  })
  return (
    <div className="mb-8">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <p className="font-semibold text-blue-800 mb-1">📚 {state} library branch data not yet collected</p>
        <p className="text-sm text-blue-700">
          We store one entry per {state} council. Visit each council&apos;s library website for full branch listings, opening hours, and services.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {councils.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-medium text-gray-800 mb-2">{c.name}</p>
            {c.libraryUrl && (
              <a href={c.libraryUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-purple-700 hover:underline">
                📚 Library Website →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  searchParams: Promise<{ state?: string }>
}

export default async function LibrariesPage({ searchParams }: Props) {
  const { state: stateParam } = await searchParams
  const activeState = stateParam ?? 'VIC'

  const libraries = activeState === 'VIC'
    ? await prisma.library.findMany({
        where: { council: { state: 'VIC' } },
        orderBy: [{ councilId: 'asc' }, { name: 'asc' }],
      })
    : []

  // Group by councilId
  const groupMap = new Map<string, typeof libraries>()
  for (const lib of libraries) {
    if (!groupMap.has(lib.councilId)) groupMap.set(lib.councilId, [])
    groupMap.get(lib.councilId)!.push(lib)
  }
  const grouped = Array.from(groupMap.entries())
    .map(([id, libs]) => ({
      id,
      name: id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
      libraries: libs,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const STATE_NAMES: Record<string, string> = {
    VIC: 'Victorian', NSW: 'New South Wales', QLD: 'Queensland',
    SA: 'South Australian', WA: 'Western Australian', TAS: 'Tasmanian',
    NT: 'Northern Territory', ACT: 'ACT',
  }
  const stateName = STATE_NAMES[activeState] ?? activeState

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-1">📚 Libraries</h1>
        <p className="text-gray-400 text-sm">
          {activeState === 'VIC'
            ? `${libraries.length} branches across Victorian councils`
            : `${stateName} council libraries`}
        </p>
      </div>

      <Suspense fallback={null}>
        <StateTabs basePath="/libraries" />
      </Suspense>

      {/* Nearby search — shown for all states */}
      <NearbySearch activeState={activeState} />

      {activeState !== 'VIC' ? (
        <NonVicLibraryNotice state={activeState} />
      ) : (
        <>
          {/* Council filter + full list — client component for interactive dropdown */}
          <LibraryList grouped={grouped} />

          {/* Sources */}
          <div className="mt-10 pt-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-400 mb-1">Sources</p>
        <ul className="text-xs text-gray-400 space-y-0.5">
          <li><a href="https://www.connectedlibraries.org.au/branches/" target="_blank" rel="noopener noreferrer" className="hover:underline">Connected Libraries (Casey / Cardinia)</a></li>
          <li><a href="https://www.grlc.vic.gov.au" target="_blank" rel="noopener noreferrer" className="hover:underline">Geelong Regional Library Corporation</a></li>
          <li><a href="https://libraries.ballarat.vic.gov.au" target="_blank" rel="noopener noreferrer" className="hover:underline">Ballarat Libraries</a></li>
          <li><a href="https://www.bendigolibrary.com.au" target="_blank" rel="noopener noreferrer" className="hover:underline">Bendigo Library Service</a></li>
          <li><a href="https://www.wyndham.vic.gov.au/services/libraries" target="_blank" rel="noopener noreferrer" className="hover:underline">Wyndham City Libraries</a></li>
          <li><a href="https://library.frankston.vic.gov.au" target="_blank" rel="noopener noreferrer" className="hover:underline">Frankston City Libraries</a></li>
          <li>Opening hours and branch data sourced from individual council websites. May not reflect temporary changes.</li>
        </ul>
          </div>
        </>
      )}
    </main>
  )
}
