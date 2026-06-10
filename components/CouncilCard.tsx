import Link from 'next/link'
import { RegionBadge } from './RegionBadge'
import { FavoriteButton } from './FavoriteButton'

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
        <h3 className="font-semibold text-(--color-primary)">{name}</h3>
        <div className="flex items-center gap-2">
          <FavoriteButton councilId={id} className="text-(--color-accent)" />
          <RegionBadge region={region} />
        </div>
      </div>
      <div className="text-sm text-gray-500 space-y-1">
        {population != null && <div>Population: {population.toLocaleString()}</div>}
        {libraryCount != null && <div>Libraries: {libraryCount}</div>}
        {eventCount != null && <div>Upcoming events: {eventCount}</div>}
      </div>
    </Link>
  )
}
