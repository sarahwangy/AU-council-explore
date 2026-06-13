'use client'
import { useState } from 'react'
import Link from 'next/link'

export interface StateRow {
  abbr: string
  name: string
  capital: string
  areaSqKm: number
  population: number
  emoji: string
  councils: number
  libraries: number
}

function fmtPop(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  return (n / 1000).toFixed(0) + 'K'
}

function fmtArea(n: number): string {
  return n.toLocaleString('en-AU') + ' km²'
}

type SortKey = 'name' | 'population' | 'areaSqKm' | 'councils' | 'libraries'

export function StatesView({ states, totalCouncils, totalLibraries }: {
  states: StateRow[]
  totalCouncils: number
  totalLibraries: number
}) {
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [sortKey, setSortKey] = useState<SortKey>('population')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...states].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey]
    if (typeof va === 'string' && typeof vb === 'string') {
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
    }
    return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-(--color-accent) ml-1">{sortAsc ? '↑' : '↓'}</span>
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-(--color-primary) mb-1">Australia by State</h1>
          <p className="text-(--color-muted) text-sm">
            {totalCouncils} councils and {totalLibraries} libraries recorded across Australia
          </p>
        </div>
        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium self-start mt-1">
          <button
            type="button"
            onClick={() => setView('cards')}
            className={`px-4 py-2 flex items-center gap-1.5 transition-colors ${view === 'cards' ? 'bg-(--color-accent) text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`px-4 py-2 flex items-center gap-1.5 transition-colors ${view === 'table' ? 'bg-(--color-accent) text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" /></svg>
            Table
          </button>
        </div>
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map((state) => (
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
                    <p className="text-lg font-semibold text-(--color-primary)">{state.councils > 0 ? state.councils : '—'}</p>
                    {state.councils > 0 && <p className="text-xs text-(--color-muted)">in system</p>}
                  </div>
                  <div className="rounded-xl bg-(--color-surface) px-4 py-3">
                    <p className="text-xs text-(--color-muted) uppercase tracking-wide mb-1">Libraries</p>
                    <p className="text-lg font-semibold text-(--color-primary)">{state.libraries > 0 ? state.libraries : '—'}</p>
                    {state.libraries > 0 && <p className="text-xs text-(--color-muted)">recorded</p>}
                  </div>
                </div>
              </div>

              {state.councils > 0 && (
                <div className="flex border-t border-(--color-border)">
                  <Link href={`/councils?state=${state.abbr}`}
                    className="flex-1 text-center py-3 text-sm font-medium text-(--color-accent) hover:bg-(--color-accent)/5 transition-colors">
                    View Councils
                  </Link>
                  <div className="w-px bg-(--color-border)" />
                  <Link href={`/libraries?state=${state.abbr}`}
                    className="flex-1 text-center py-3 text-sm font-medium text-(--color-accent) hover:bg-(--color-accent)/5 transition-colors">
                    View Libraries
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-(--color-border) overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-(--color-surface) border-b border-(--color-border)">
                  <th className="text-left px-5 py-3 font-semibold text-(--color-muted) uppercase tracking-wide text-xs w-8"></th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('name')} className="flex items-center font-semibold text-(--color-muted) uppercase tracking-wide text-xs hover:text-(--color-primary) transition-colors">
                      State <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">
                    <span className="font-semibold text-(--color-muted) uppercase tracking-wide text-xs">Capital</span>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button onClick={() => handleSort('population')} className="flex items-center ml-auto font-semibold text-(--color-muted) uppercase tracking-wide text-xs hover:text-(--color-primary) transition-colors">
                      Population <SortIcon col="population" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">
                    <button onClick={() => handleSort('areaSqKm')} className="flex items-center ml-auto font-semibold text-(--color-muted) uppercase tracking-wide text-xs hover:text-(--color-primary) transition-colors">
                      Area <SortIcon col="areaSqKm" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button onClick={() => handleSort('councils')} className="flex items-center ml-auto font-semibold text-(--color-muted) uppercase tracking-wide text-xs hover:text-(--color-primary) transition-colors">
                      Councils <SortIcon col="councils" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button onClick={() => handleSort('libraries')} className="flex items-center ml-auto font-semibold text-(--color-muted) uppercase tracking-wide text-xs hover:text-(--color-primary) transition-colors">
                      Libraries <SortIcon col="libraries" />
                    </button>
                  </th>
                  <th className="px-4 py-3 hidden sm:table-cell"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((state, i) => (
                  <tr key={state.abbr} className={`border-b border-(--color-border) last:border-0 hover:bg-(--color-surface)/60 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-5 py-4 text-xl">{state.emoji}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-(--color-primary)">{state.name}</p>
                      <p className="text-xs text-(--color-muted) sm:hidden">{state.capital}</p>
                    </td>
                    <td className="px-4 py-4 text-(--color-muted) hidden sm:table-cell">{state.capital}</td>
                    <td className="px-4 py-4 text-right font-medium text-(--color-primary)">{fmtPop(state.population)}</td>
                    <td className="px-4 py-4 text-right text-(--color-muted) hidden md:table-cell">{fmtArea(state.areaSqKm)}</td>
                    <td className="px-4 py-4 text-right">
                      {state.councils > 0 ? (
                        <Link href={`/councils?state=${state.abbr}`}
                          className="font-semibold text-(--color-accent) hover:underline">
                          {state.councils}
                        </Link>
                      ) : <span className="text-(--color-muted)">—</span>}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {state.libraries > 0 ? (
                        <Link href={`/libraries?state=${state.abbr}`}
                          className="font-semibold text-(--color-accent) hover:underline">
                          {state.libraries}
                        </Link>
                      ) : <span className="text-(--color-muted)">—</span>}
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      {state.councils > 0 && (
                        <div className="flex gap-2 justify-end">
                          <Link href={`/councils?state=${state.abbr}`}
                            className="text-xs px-2.5 py-1 rounded-lg border border-(--color-border) text-(--color-accent) hover:bg-(--color-accent)/5 transition-colors whitespace-nowrap">
                            Councils →
                          </Link>
                          <Link href={`/libraries?state=${state.abbr}`}
                            className="text-xs px-2.5 py-1 rounded-lg border border-(--color-border) text-(--color-accent) hover:bg-(--color-accent)/5 transition-colors whitespace-nowrap">
                            Libraries →
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-(--color-surface) border-t-2 border-(--color-border)">
                  <td className="px-5 py-3"></td>
                  <td className="px-4 py-3 font-semibold text-(--color-primary) text-sm">Total</td>
                  <td className="hidden sm:table-cell"></td>
                  <td className="px-4 py-3 text-right font-semibold text-(--color-primary) text-sm">
                    {fmtPop(states.reduce((s, r) => s + r.population, 0))}
                  </td>
                  <td className="hidden md:table-cell"></td>
                  <td className="px-4 py-3 text-right font-semibold text-(--color-primary) text-sm">{totalCouncils}</td>
                  <td className="px-4 py-3 text-right font-semibold text-(--color-primary) text-sm">{totalLibraries}</td>
                  <td className="hidden sm:table-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
