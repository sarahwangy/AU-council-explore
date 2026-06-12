'use client'
import { useFavorites } from '@/hooks/useFavorites'

interface Props {
  libraryId: string
  className?: string
}

export function FavoriteLibraryButton({ libraryId, className = '' }: Props) {
  const { isLibraryFavorite, toggleLibrary } = useFavorites()
  const active = isLibraryFavorite(libraryId)

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggleLibrary(libraryId) }}
      aria-label={active ? 'Remove library from favourites' : 'Add library to favourites'}
      title={active ? 'Remove from favourites' : 'Save to My Libraries'}
      className={`transition-transform hover:scale-110 focus:outline-none ${className}`}
    >
      {active ? '★' : '☆'}
    </button>
  )
}
