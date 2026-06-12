'use client'
import { useState } from 'react'
import { LibraryCard, LibraryItem } from './LibraryCard'

interface GroupedCouncil {
  id: string
  name: string
  libraries: LibraryItem[]
}

export function LibraryList({ grouped }: { grouped: GroupedCouncil[] }) {
  const [councilFilter, setCouncilFilter] = useState('')

  const filtered = councilFilter ? grouped.filter(g => g.id === councilFilter) : grouped

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Libraries</h2>
        <select
          value={councilFilter}
          onChange={e => setCouncilFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
        >
          <option value="">All councils</option>
          {grouped.map(g => (
            <option key={g.id} value={g.id}>{g.name} ({g.libraries.length})</option>
          ))}
        </select>
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
