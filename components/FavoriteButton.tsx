'use client'
import { useFavorites } from '@/hooks/useFavorites'

interface Props {
  councilId: string
  className?: string
}

export function FavoriteButton({ councilId, className = '' }: Props) {
  const { isFavorite, toggleCouncil } = useFavorites()
  const active = isFavorite(councilId)

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggleCouncil(councilId) }}
      aria-label={active ? 'Remove from favourites' : 'Add to favourites'}
      title={active ? 'Remove from favourites' : 'Add to favourites'}
      className={`text-xl leading-none transition-transform hover:scale-110 focus:outline-none ${className}`}
    >
      {active ? '★' : '☆'}
    </button>
  )
}
