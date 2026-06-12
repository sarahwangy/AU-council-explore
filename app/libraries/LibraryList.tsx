'use client'
import { useState } from 'react'
import { LibraryCard, LibraryItem } from './LibraryCard'

interface GroupedCouncil {
  id: string
  name: string
  libraries: LibraryItem[]
}

function exportLibrariesCSV(groups: GroupedCouncil[]) {
  const rows = [['Council', 'Library Name', 'Suburb', 'Address', 'Phone', 'URL']]
  for (const g of groups) {
    for (const lib of g.libraries) {
      rows.push([g.name, lib.name, lib.suburb ?? '', lib.address ?? '', lib.phone ?? '', lib.url ?? ''])
    }
  }
  const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'victoria-libraries.csv'
  a.click()
}

export function LibraryList({ grouped }: { grouped: GroupedCouncil[] }) {
  const [councilFilter, setCouncilFilter] = useState('')

  const filtered = councilFilter ? grouped.filter(g => g.id === councilFilter) : grouped

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Libraries</h2>
        <div className="flex items-center gap-2">
        <select
          title="Filter by council"
          value={councilFilter}
          onChange={e => setCouncilFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
        >
          <option value="">All councils</option>
          {grouped.map(g => (
            <option key={g.id} value={g.id}>{g.name} ({g.libraries.length})</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => exportLibrariesCSV(filtered)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          ⬇ Export CSV
        </button>
        </div>
      </div>

      <div className="space-y-8">
        {filtered.map(group => (
          <div key={group.id}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
              {group.name}
              <span className="font-normal text-gray-400">({group.libraries.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.libraries.map(lib => (
                <LibraryCard key={lib.id} lib={lib} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
