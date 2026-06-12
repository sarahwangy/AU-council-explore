// components/NonVicCouncilCard.tsx
import Link from 'next/link'

interface Props {
  id: string
  name: string
  state: string
  population?: number | null
  areaSqKm?: number | null
  libraryUrl?: string | null
  website?: string | null
}

export function NonVicCouncilCard({ id, name, state, population, areaSqKm, libraryUrl, website }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Link href={`/councils/${id}`} className="font-semibold text-(--color-primary) hover:underline">
          {name}
        </Link>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{state}</span>
      </div>
      <div className="text-sm text-gray-500 space-y-1 mb-3">
        {population != null && <div>Population: {population.toLocaleString()}</div>}
        {areaSqKm != null && <div>Area: {areaSqKm.toLocaleString()} km²</div>}
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">
            Council website ↗
          </a>
        )}
      </div>
      {libraryUrl && (
        <a
          href={libraryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors"
        >
          📚 Library Website →
        </a>
      )}
    </div>
  )
}
