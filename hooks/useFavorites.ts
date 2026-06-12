'use client'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'mce_favorites'

interface Favorites {
  councils: string[]
  libraries: string[] // library IDs
}

const DEFAULT: Favorites = { councils: [], libraries: [] }

function load(): Favorites {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return { councils: stored.councils ?? [], libraries: stored.libraries ?? [] }
  } catch {
    return DEFAULT
  }
}

function save(f: Favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(f))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>(DEFAULT)

  useEffect(() => {
    setFavorites(load())
  }, [])

  const toggleCouncil = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.councils.includes(id)
        ? { ...prev, councils: prev.councils.filter(c => c !== id) }
        : { ...prev, councils: [...prev.councils, id] }
      save(next)
      return next
    })
  }, [])

  const toggleLibrary = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.libraries.includes(id)
        ? { ...prev, libraries: prev.libraries.filter(l => l !== id) }
        : { ...prev, libraries: [...prev.libraries, id] }
      save(next)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (id: string) => favorites.councils.includes(id),
    [favorites.councils]
  )

  const isLibraryFavorite = useCallback(
    (id: string) => favorites.libraries.includes(id),
    [favorites.libraries]
  )

  return { favorites, toggleCouncil, toggleLibrary, isFavorite, isLibraryFavorite }
}
