'use client'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'mce_favorites'

interface Favorites {
  councils: string[]
}

function load(): Favorites {
  if (typeof window === 'undefined') return { councils: [] }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{"councils":[]}')
  } catch {
    return { councils: [] }
  }
}

function save(f: Favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(f))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>({ councils: [] })

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

  const isFavorite = useCallback(
    (id: string) => favorites.councils.includes(id),
    [favorites.councils]
  )

  return { favorites, toggleCouncil, isFavorite }
}
