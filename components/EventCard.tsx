interface Props {
  title: string
  council: string
  venue?: string | null
  startAt: string | Date
  category?: string | null
  bookingUrl?: string | null
}

export function EventCard({ title, council, venue, startAt, category, bookingUrl }: Props) {
  const date = new Date(startAt)
  const dateStr = date.toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

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
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-primary)] underline"
            >
              Book
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
