'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useFavorites } from '@/hooks/useFavorites'
import { FavoriteButton } from '@/components/FavoriteButton'
import { SubscribeForm } from '@/components/SubscribeForm'

interface Library {
  id: string
  name: string
  url?: string | null
  address?: string | null
  suburb?: string | null
  phone?: string | null
  council: { id: string; name: string }
}

interface NearbyLibrary {
  id: string
  name: string
  councilId: string
  address: string | null
  suburb: string | null
  url: string | null
  lat: number
  lng: number
  hoursJson: string | null
  distance: number
}

function getLibraryOpenStatus(hoursJson: string | null): { todayHours: string | null; isOpen: boolean } | null {
  if (!hoursJson) return null
  try {
    const hours = JSON.parse(hoursJson) as Record<string, string | null>
    const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Melbourne' }))
    const dayKey = DAYS[now.getDay()]
    const todayHours = hours[dayKey] ?? null
    if (!todayHours) return { todayHours: null, isOpen: false }
    const [open, close] = todayHours.split('-').map(t => t.trim())
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m ?? 0) }
    const nowMins = now.getHours() * 60 + now.getMinutes()
    return { todayHours, isOpen: nowMins >= toMins(open) && nowMins < toMins(close) }
  } catch { return null }
}

interface Event {
  id: string
  title: string
  startAt: string
  endAt?: string | null
  venue?: string | null
  category?: string | null
  ageGroup?: string | null
  isFree?: boolean
  requiresBooking?: boolean
  bookingUrl?: string | null
  source: string
  council: { name: string }
  councilId: string
}

interface ApiResponse {
  events: Event[]
  total: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
  }
}

const SOURCE_LABELS: Record<string, string> = {
  'mylibrary': 'Library', eventbrite: 'Eventbrite', humanitix: 'Humanitix', official: 'Official',
}

export default function MyEventsPage() {
  const t = useTranslations('myEvents')
  const { favorites, toggleCouncil, toggleLibrary, isFavorite } = useFavorites()
  const [events, setEvents] = useState<Event[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [libraries, setLibraries] = useState<Library[]>([])
  const [suburbQuery, setSuburbQuery] = useState('')
  const [nearbyLibraries, setNearbyLibraries] = useState<NearbyLibrary[] | null>(null)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState('')
  const LIMIT = 20

  const councilIds = favorites.councils
  const libraryIds = favorites.libraries

  useEffect(() => {
    if (libraryIds.length === 0) {
      setLibraries([])
      return
    }
    fetch(`/api/libraries?ids=${libraryIds.join(',')}`)
      .then(r => r.json())
      .then((data: Library[]) => setLibraries(data))
  }, [libraryIds.join(',')])

  useEffect(() => {
    if (councilIds.length === 0) {
      setEvents([])
      setTotal(0)
      setLoading(false)
      return
    }
    setLoading(true)
    const params = new URLSearchParams({ councils: councilIds.join(','), limit: String(LIMIT), page: String(page) })
    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then((data: ApiResponse) => { setEvents(data.events); setTotal(data.total) })
      .finally(() => setLoading(false))
  }, [councilIds.join(','), page])

  async function searchNearby(e: React.FormEvent) {
    e.preventDefault()
    if (!suburbQuery.trim()) return
    setNearbyLoading(true)
    setNearbyError('')
    setNearbyLibraries(null)
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) { setNearbyError('Map token not configured'); return }
      const query = encodeURIComponent(`${suburbQuery.trim()}, Victoria, Australia`)
      const geoRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&country=AU&proximity=145.0,-37.8&limit=1`)
      const geoData = await geoRes.json() as { features?: { center: [number, number] }[] }
      const feature = geoData.features?.[0]
      if (!feature) { setNearbyError('Suburb not found — try another name'); return }
      const [lng, lat] = feature.center
      const nearbyRes = await fetch(`/api/libraries/nearby?lat=${lat}&lng=${lng}&limit=5`)
      const data = await nearbyRes.json()
      setNearbyLibraries(data)
    } catch {
      setNearbyError('Search failed — please try again')
    } finally {
      setNearbyLoading(false)
    }
  }

  if (!loading && councilIds.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="py-24 flex flex-col items-center text-center">
          <div className="text-6xl mb-5">☆</div>
          <h1 className="text-2xl font-bold text-(--color-primary) mb-3">{t('emptyTitle')}</h1>
          <p className="text-gray-400 mb-8">{t('emptyDesc')}</p>
          <Link href="/councils" className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold bg-(--color-primary) hover:opacity-90 transition-opacity">
            {t('browseCouncils')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-primary) mb-1">{t('heading')}</h1>
        <p className="text-gray-400 text-sm">{t(councilIds.length === 1 ? 'favouriteCount' : 'favouriteCountPlural', { count: councilIds.length })}</p>
      </div>

      {/* Favourite councils grid */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Councils</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {councilIds.map(id => (
            <div key={id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between group">
              <Link href={`/councils/${id}`} className="font-medium text-sm text-gray-800 hover:text-(--color-primary) transition-colors capitalize">
                {id.replace(/-/g, ' ')}
              </Link>
              <button
                type="button"
                onClick={() => toggleCouncil(id)}
                className="text-amber-400 hover:text-gray-300 transition-colors text-lg"
                title="Remove from favourites"
              >
                ★
              </button>
            </div>
          ))}
          <Link
            href="/councils"
            className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4 flex items-center justify-center text-sm text-gray-400 hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
          >
            + {t('addMore')}
          </Link>
        </div>
      </section>

      {/* My Libraries */}
      <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">My Libraries</h2>
          {libraryIds.length === 0 ? (
            <Link
              href="/councils"
              className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-400 hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Save a library from a council page
            </Link>
          ) : libraries.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1,2].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {libraries.map(lib => (
                lib.url ? (
                  <a
                    key={lib.id}
                    href={lib.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-(--color-primary)/30 transition-all block"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-(--color-primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-800 leading-snug">{lib.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{lib.council.name}</p>
                        {lib.address && (
                          <p className="text-xs text-gray-500 mt-1">{lib.address}{lib.suburb ? `, ${lib.suburb}` : ''}</p>
                        )}
                        {lib.phone && (
                          <p className="text-xs text-gray-500 mt-0.5">{lib.phone}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); toggleLibrary(lib.id) }}
                        className="text-amber-400 hover:text-gray-300 transition-colors text-lg shrink-0"
                        title="Remove from My Libraries"
                      >
                        ★
                      </button>
                    </div>
                  </a>
                ) : (
                  <div key={lib.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-(--color-primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-800 leading-snug">{lib.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{lib.council.name}</p>
                        {lib.address && (
                          <p className="text-xs text-gray-500 mt-1">{lib.address}{lib.suburb ? `, ${lib.suburb}` : ''}</p>
                        )}
                        {lib.phone && (
                          <p className="text-xs text-gray-500 mt-0.5">{lib.phone}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleLibrary(lib.id)}
                        className="text-amber-400 hover:text-gray-300 transition-colors text-lg shrink-0"
                        title="Remove from My Libraries"
                      >
                        ★
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </section>

      {/* Nearby Library Search */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Find Nearby Libraries</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={searchNearby} className="flex gap-2">
            <input
              type="text"
              value={suburbQuery}
              onChange={e => setSuburbQuery(e.target.value)}
              placeholder="Enter suburb name (e.g. Fitzroy, Clayton…)"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30 focus:border-(--color-primary)"
            />
            <button
              type="submit"
              disabled={nearbyLoading || !suburbQuery.trim()}
              className="px-4 py-2 bg-(--color-primary) text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {nearbyLoading ? '…' : 'Search'}
            </button>
          </form>

          {nearbyError && (
            <p className="mt-3 text-sm text-red-500">{nearbyError}</p>
          )}

          {nearbyLibraries && nearbyLibraries.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">No libraries found near this suburb.</p>
          )}

          {nearbyLibraries && nearbyLibraries.length > 0 && (
            <div className="mt-4 space-y-3">
              {nearbyLibraries.map((lib, i) => {
                const status = getLibraryOpenStatus(lib.hoursJson)
                return (
                  <div key={lib.id} className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {lib.url ? (
                          <a href={lib.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm text-gray-800 hover:text-(--color-primary) transition-colors">
                            {lib.name}
                          </a>
                        ) : (
                          <span className="font-medium text-sm text-gray-800">{lib.name}</span>
                        )}
                        <span className="text-xs text-gray-400">{lib.distance < 1 ? `${Math.round(lib.distance * 1000)}m` : `${lib.distance.toFixed(1)}km`} away</span>
                      </div>
                      {lib.address && (
                        <p className="text-xs text-gray-500">{lib.address}{lib.suburb ? `, ${lib.suburb}` : ''}</p>
                      )}
                      {status && (
                        <p className="text-xs mt-0.5">
                          <span className={status.isOpen ? 'text-green-600' : 'text-red-500'}>
                            {status.isOpen ? '🟢 Open' : '🔴 Closed'}
                          </span>
                          {status.todayHours && <span className="text-gray-400"> · Today {status.todayHours}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe */}
      <section className="mb-8">
        <SubscribeForm />
      </section>

      {/* Upcoming events */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Upcoming Events {!loading && total > 0 && <span className="normal-case font-normal text-gray-400">— {total} total</span>}
        </h2>

        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-50 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-500 font-medium">{t('noEvents')}</p>
            <p className="text-gray-400 text-sm mt-1">Check back closer to the event dates</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-3">
            {events.map(e => {
              const { date, time } = formatDate(e.startAt)
              const sourceLabel = SOURCE_LABELS[e.source] ?? e.source
              return (
                <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
                  <div className="p-4 flex gap-4 items-start">
                    {/* Date block */}
                    <div className="shrink-0 w-14 text-center bg-blue-50 rounded-lg py-2">
                      <p className="text-xs text-blue-400 font-medium">{date.split(' ')[0]}</p>
                      <p className="text-lg font-bold text-blue-700 leading-none">{date.split(' ')[1]}</p>
                      <p className="text-xs text-blue-500">{date.split(' ')[2]}</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 leading-snug">{e.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <Link
                          href={`/councils/${e.councilId}`}
                          className="text-xs text-(--color-primary) hover:underline font-medium"
                          onClick={ev => ev.stopPropagation()}
                        >
                          {e.council.name}
                        </Link>
                        {e.venue && <span className="text-xs text-gray-400">· {e.venue}</span>}
                        <span className="text-xs text-gray-400">{time}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {e.category && (
                          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{e.category}</span>
                        )}
                        <span className="text-xs text-gray-300">{sourceLabel}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {e.bookingUrl && (
                        <a
                          href={e.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium text-white bg-(--color-primary) rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Book →
                        </a>
                      )}
                      <FavoriteButton councilId={e.councilId} className="text-sm" />
                    </div>
                  </div>
                  {/* Badges row */}
                  <div className="px-4 pb-3 flex flex-wrap gap-1">
                    {e.isFree !== false && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Free</span>
                    )}
                    {e.ageGroup && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{e.ageGroup.replace(/-/g, ' ')}</span>
                    )}
                    {e.requiresBooking && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Booking required</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-400">Page {page} of {Math.ceil(total / LIMIT)}</span>
            <button
              type="button"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / LIMIT)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
