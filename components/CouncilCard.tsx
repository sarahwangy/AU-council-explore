import Link from 'next/link'
import { RegionBadge } from './RegionBadge'

interface Props {
  id: string
  name: string
  region: string
  population?: number | null
  libraryCount?: number
  eventCount?: number
}

export function CouncilCard({ id, name, region, population, libraryCount, eventCount }: Props) {
  return (
    <Link
      href={`/councils/${id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-[var(--color-primary)]">{name}</h3>
        <RegionBadge region={region} />
      </div>
      <div className="text-sm text-gray-500 space-y-1">
        {population != null && <div>Population: {population.toLocaleString()}</div>}
        {libraryCount != null && <div>Libraries: {libraryCount}</div>}
        {eventCount != null && <div>Upcoming events: {eventCount}</div>}
      </div>
    </Link>
  )
}
