'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Council {
  id: string
  name: string
  region: string
}

interface Props {
  councils: Council[]
  defaultValue?: string
  region?: string
  placeholder?: string
}

export function CouncilSearch({ councils, defaultValue = '', region, placeholder = 'Search councils...' }: Props) {
  const [query, setQuery] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = query.length >= 3
    ? councils.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function navigate(councilId?: string, searchQ?: string) {
    setOpen(false)
    if (councilId) {
      router.push(`/councils/${councilId}`)
      return
    }
    const params = new URLSearchParams()
    if (region) params.set('region', region)
    if (searchQ) params.set('q', searchQ)
    router.push(`/councils?${params}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length === 1) {
        navigate(suggestions[0].id)
      } else {
        navigate(undefined, query)
      }
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm mb-6">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => query.length >= 3 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {suggestions.map(c => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={() => navigate(c.id)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-800">{c.name}</span>
                <span className="ml-auto text-xs text-gray-400 capitalize">{c.region}</span>
              </button>
            </li>
          ))}
          {query.length >= 3 && (
            <li>
              <button
                type="button"
                onMouseDown={() => navigate(undefined, query)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left text-gray-500 hover:bg-gray-50 border-t border-gray-100 transition-colors"
              >
                <span>🔍</span> Show all results for &ldquo;{query}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
