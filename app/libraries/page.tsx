import { prisma } from '@/lib/prisma'
import { NearbySearch } from './NearbySearch'
import { LibraryList } from './LibraryList'

export default async function LibrariesPage() {
  const libraries = await prisma.library.findMany({
    orderBy: [{ councilId: 'asc' }, { name: 'asc' }],
  })

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-1">📚 Libraries</h1>
        <p className="text-gray-400 text-sm">{libraries.length} branches across 31 Melbourne councils</p>
      </div>

      {/* Nearby search — client component */}
      <NearbySearch />

      {/* Council filter + full list — client component for interactive dropdown */}
      <LibraryList grouped={grouped} />
    </main>
  )
}
