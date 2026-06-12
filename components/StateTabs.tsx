'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'] as const
export type StateCode = typeof STATES[number]

interface Props {
  basePath: string        // e.g. "/councils", "/events"
  preserveParams?: string[] // other params to keep, e.g. ['region', 'q']
}

export function StateTabs({ basePath, preserveParams = [] }: Props) {
  const searchParams = useSearchParams()
  const activeState = (searchParams.get('state') ?? 'VIC') as StateCode

  function buildHref(state: StateCode) {
    const params = new URLSearchParams()
    params.set('state', state)
    for (const key of preserveParams) {
      const val = searchParams.get(key)
      if (val) params.set(key, val)
    }
    return `${basePath}?${params.toString()}`
  }

  return (
    <div className="flex flex-wrap gap-1.5 mb-6">
      {STATES.map(s => (
        <Link
          key={s}
          href={buildHref(s)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            activeState === s
              ? 'bg-(--color-primary) text-white border-transparent'
              : 'border-gray-300 text-gray-600 hover:border-(--color-primary) hover:text-(--color-primary)'
          }`}
        >
          {s}
        </Link>
      ))}
    </div>
  )
}
