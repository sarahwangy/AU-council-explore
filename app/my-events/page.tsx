'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useFavorites } from '@/hooks/useFavorites'
import { EventCard } from '@/components/EventCard'

interface Event {
  id: string
  title: string
  startAt: string
  venue?: string | null
  category?: string | null
  bookingUrl?: string | null
  source: string
  council: { name: string }
}

interface ApiResponse {
  events: Event[]
  total: number
}

export default function MyEventsPage() {
  const t = useTranslations('myEvents')
  const { favorites } = useFavorites()
  const [events, setEvents] = useState<Event[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const LIMIT = 20

  const councilIds = favorites.councils

  useEffect(() => {
    if (councilIds.length === 0) {
      setEvents([])
      setTotal(0)
      setLoading(false)
      return
    }
    setLoading(true)
    const params = new URLSearchParams({
      councils: councilIds.join(','),
      limit: String(LIMIT),
      page: String(page),
    })
    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then((data: ApiResponse) => {
        setEvents(data.events)
        setTotal(data.total)
      })
      .finally(() => setLoading(false))
  }, [councilIds.join(','), page])

  if (!loading && councilIds.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">☆</div>
        <h1 className="text-2xl font-bold text-(--color-primary) mb-3">{t('emptyTitle')}</h1>
        <p className="text-gray-500 mb-6">{t('emptyDesc')}</p>
        <Link
          href="/councils"
          className="inline-block px-5 py-2 rounded-lg text-white text-sm font-medium bg-(--color-primary)"
        >
          {t('browseCouncils')}
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-(--color-primary)">{t('heading')}</h1>
        <span className="text-sm text-gray-400">
          {t(councilIds.length === 1 ? 'favouriteCount' : 'favouriteCountPlural', { count: councilIds.length })}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {councilIds.map(id => (
          <Link
            key={id}
            href={`/councils/${id}`}
            className="px-3 py-1 rounded-full text-sm border border-gray-300 hover:border-(--color-primary) transition-colors capitalize"
          >
            {id.replace(/-/g, ' ')}
          </Link>
        ))}
        <Link href="/councils" className="px-3 py-1 rounded-full text-sm text-gray-400 hover:text-gray-700">
          {t('addMore')}
        </Link>
      </div>

      {loading && <p className="text-gray-400 py-8">{t('loading')}</p>}

      {!loading && events.length === 0 && (
        <p className="text-gray-400 py-8">{t('noEvents')}</p>
      )}

      {!loading && events.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{t('totalEvents', { total })}</p>
          <div className="space-y-3">
            {events.map(e => (
              <EventCard
                key={e.id}
                title={e.title}
                council={e.council.name}
                venue={e.venue}
                startAt={new Date(e.startAt)}
                category={e.category}
                bookingUrl={e.bookingUrl}
                source={e.source}
              />
            ))}
          </div>

          {total > LIMIT && (
            <div className="flex justify-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                {t('prev')}
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {t('page', { page, total: Math.ceil(total / LIMIT) })}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / LIMIT)}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
