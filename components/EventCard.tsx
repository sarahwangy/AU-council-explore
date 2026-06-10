const SOURCE_LABELS: Record<string, string> = {
  'mylibrary.digital': 'mylibrary',
  eventbrite: 'Eventbrite',
  humanitix: 'Humanitix',
  official: 'Official',
}

interface Props {
  title: string
  council: string
  venue?: string | null
  startAt: string | Date
  category?: string | null
  bookingUrl?: string | null
  source?: string | null
}

export function EventCard({ title, council, venue, startAt, category, bookingUrl, source }: Props) {
  const date = new Date(startAt)
  const dateStr = date.toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  const sourceLabel = source ? (SOURCE_LABELS[source] ?? source) : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{council}{venue ? ` · ${venue}` : ''}</p>
          <p className="text-xs text-gray-400 mt-1">{dateStr} {timeStr}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {category && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {category}
            </span>
          )}
          {sourceLabel && (
            <span className="text-xs text-gray-400">{sourceLabel}</span>
          )}
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-(--color-primary) underline"
            >
              Book →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
