'use client'
import { useState } from 'react'
import { LibraryCard, LibraryItem, getOpenStatus } from './LibraryCard'

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

type StatusFilter = '' | 'open' | 'closed'

export function LibraryList({ grouped }: { grouped: GroupedCouncil[] }) {
  const [councilFilter, setCouncilFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')

  const byCouncil = councilFilter ? grouped.filter(g => g.id === councilFilter) : grouped

  const filtered = byCouncil
    .map(group => {
      if (!statusFilter) return group
      const libs = group.libraries.filter(lib => {
        const status = getOpenStatus(lib.hoursJson)
        if (statusFilter === 'open') return status?.isOpen === true
        if (statusFilter === 'closed') return !status?.isOpen
        return true
      })
      return { ...group, libraries: libs }
    })
    .filter(group => group.libraries.length > 0)

  const totalShown = filtered.reduce((sum, g) => sum + g.libraries.length, 0)

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Libraries</h2>
          {statusFilter && (
            <span className="text-xs text-gray-400">· {totalShown} shown</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Open/closed filter */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {([['', 'All'], ['open', '🟢 Open now'], ['closed', '🔴 Closed']] as [StatusFilter, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setStatusFilter(val)}
                className={`px-3 py-1.5 transition-colors ${statusFilter === val ? 'bg-purple-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
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
            onClick={() => exportLibrariesCSV(byCouncil)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No libraries match this filter.</p>
      ) : (
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
      )}
    </section>
  )
}
