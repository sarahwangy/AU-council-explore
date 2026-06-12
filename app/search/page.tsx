'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface EventResult {
  id: string
  title: string
  venue: string | null
  suburb: string | null
  startAt: string
  councilName: string
  libraryName: string | null
  isFree: boolean
  requiresBooking: boolean
  bookingUrl: string | null
}

interface LibraryResult {
  id: string
  name: string
  address: string | null
  suburb: string | null
  councilName: string
  url: string | null
}

interface SearchResult {
  summary: string
  events: EventResult[]
  libraries: LibraryResult[]
}

const SUGGESTIONS = [
  'sewing classes mount waverley',
  'story time geelong',
  'kids craft ballarat',
  'english conversation frankston',
  'book club inner melbourne',
  'makerspace bendigo',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSearch(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })
      if (!res.ok) throw new Error('Search failed')
      setResult(await res.json())
    } catch {
      setError('Search unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleSearch(query)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">✨</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Search</h1>
        <p className="text-gray-500 text-sm">Ask in plain English — events, libraries, local activities near you</p>
      </div>

      {/* Search box */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. sewing classes mount waverley"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-xl bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? '…' : 'Ask'}
          </button>
        </div>
      </form>

      {/* Suggestion pills */}
      {!result && !loading && (
        <div className="flex flex-wrap gap-2 mb-8">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleSearch(s)}
              className="px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="animate-spin text-lg">⟳</span>
            <span className="text-sm font-semibold text-purple-700">Searching database + web…</span>
          </div>
          <div className="animate-pulse space-y-2.5">
            <div className="h-3.5 bg-purple-100 rounded w-full" />
            <div className="h-3.5 bg-purple-100 rounded w-5/6" />
            <div className="h-3.5 bg-purple-100 rounded w-4/5" />
            <div className="h-3.5 bg-purple-100 rounded w-3/4" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* AI Overview with Markdown */}
          <div className="bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✨</span>
              <span className="text-sm font-semibold text-purple-700">AI Overview</span>
              <span className="ml-auto text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border">Powered by Claude + Web</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700
              prose-headings:text-gray-800 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
              prose-h2:text-base prose-h3:text-sm
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
              prose-ul:my-2 prose-li:my-0.5
              prose-p:my-2 prose-p:leading-relaxed">
              <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
          </div>

          {/* Matching libraries */}
          {result.libraries.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">📍 Nearby Libraries</h2>
              <div className="space-y-2">
                {result.libraries.map(lib => (
                  <div key={lib.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xl shrink-0">📚</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">{lib.name}</p>
                      <p className="text-xs text-gray-400">{lib.address}{lib.suburb ? `, ${lib.suburb}` : ''} · {lib.councilName}</p>
                    </div>
                    {lib.url && (
                      <a href={lib.url} target="_blank" rel="noopener noreferrer"
                        className="ml-auto text-xs text-purple-600 hover:underline shrink-0">Website →</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching events */}
          {result.events.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">🗓 Matching Events</h2>
              <div className="space-y-2">
                {result.events.map(e => {
                  const date = new Date(e.startAt)
                  const dateStr = date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
                  const timeStr = date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Melbourne' })
                  return (
                    <div key={e.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-snug">{e.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {dateStr} · {timeStr}{e.venue ? ` · ${e.venue}` : ''}
                          </p>
                          <p className="text-xs text-gray-400">{e.councilName}{e.libraryName ? ` — ${e.libraryName}` : ''}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {e.isFree && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Free</span>}
                          {e.requiresBooking && e.bookingUrl && (
                            <a href={e.bookingUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">
                              Book →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-center mt-4">
                <Link href={`/events?q=${encodeURIComponent(query)}`} className="text-sm text-purple-600 hover:underline">
                  See all events matching &ldquo;{query}&rdquo; →
                </Link>
              </div>
            </div>
          )}

          {result.events.length === 0 && result.libraries.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm">No local database matches. Check the <Link href="/events" className="text-purple-600 underline">events page</Link> or try different keywords.</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
