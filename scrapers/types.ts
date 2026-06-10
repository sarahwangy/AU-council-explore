export interface ScrapedEvent {
  title: string
  description?: string
  category?: string
  startAt: Date
  endAt?: Date
  venue?: string
  bookingUrl?: string
  externalId?: string
}
