const CATEGORY_RULES: [string, string[]][] = [
  ['Children', ['toddler', 'story time', 'storytime', 'kids', 'children', 'baby', 'babies', 'lego', 'chess club', 'school holiday', 'craft for kids', 'junior', 'youth', 'holiday program']],
  ['Craft', ['craft', 'knit', 'sew', 'crochet', 'art class', 'drawing', 'painting', 'pottery', 'maker']],
  ['Reading', ['book club', 'reading group', 'author talk', 'author event', 'library talk', 'literary', 'poetry', 'writing workshop', 'book launch']],
  ['Health', ['health', 'wellbeing', 'yoga', 'meditation', 'fitness', 'mental health', 'dementia', 'seniors fitness', 'first aid']],
  ['Cultural', ['cultural', 'multicultural', 'language', 'heritage', 'festival', 'chinese', 'italian', 'greek', 'vietnamese', 'hindi', 'arabic']],
  ['English', ['english class', 'english lesson', 'esl', 'conversation class', 'english for', 'learn english', 'english conversation']],
]

// Age group detection from title + description
const AGE_RULES: [string, string[]][] = [
  ['kids-0-5',   ['baby', 'babies', 'toddler', '0-5', '0 to 5', 'under 5', 'under five', 'bump', 'mothers group', 'playgroup', 'rhyme time', 'bouncing babies']],
  ['school-age', ['school holiday', 'holiday program', 'school age', 'primary school', 'lego club', 'chess club', 'coding for kids', 'homework help', 'after school', 'junior', 'tween']],
  ['senior',     ['senior', 'aged care', 'dementia', 'over 55', '55+', 'over 60', '60+', 'older adult', 'retiree', 'retirement']],
  ['adult',      ['adult', 'grown up', 'grownup']],
]

// Booking required detection
const BOOKING_REQUIRED_KEYWORDS = [
  'booking required', 'bookings required', 'registration required', 'registrations required',
  'book your spot', 'book your place', 'must register', 'rsvp required', 'rsvp essential',
  'tickets required', 'reserve your', 'limited places', 'places are limited',
]

// Not free detection (override the default isFree=true)
const NOT_FREE_KEYWORDS = [
  'cost:', 'fee:', 'price:', 'tickets from', 'starting from $', 'adults $', 'children $',
  'entry fee', 'paid event', 'ticketed event',
]

export interface EventClassification {
  category: string | undefined
  ageGroup: string | undefined
  requiresBooking: boolean
  isFree: boolean
}

export function classifyEvent(title: string, scraperCategory?: string, description?: string): string | undefined {
  if (scraperCategory) return scraperCategory
  const lower = title.toLowerCase()
  for (const [cat, keywords] of CATEGORY_RULES) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return undefined
}

export function classifyEventFull(title: string, description?: string, scraperCategory?: string): EventClassification {
  const text = `${title} ${description ?? ''}`.toLowerCase()

  // Category
  let category: string | undefined = scraperCategory
  if (!category) {
    for (const [cat, keywords] of CATEGORY_RULES) {
      if (keywords.some(k => text.includes(k))) { category = cat; break }
    }
  }

  // Age group — check title first (stronger signal), then description
  let ageGroup: string | undefined
  for (const [group, keywords] of AGE_RULES) {
    if (keywords.some(k => text.includes(k))) { ageGroup = group; break }
  }
  // Children category always implies school-age or kids-0-5
  if (!ageGroup && category === 'Children') {
    ageGroup = text.includes('school') ? 'school-age' : 'kids-0-5'
  }

  // Booking
  const requiresBooking = BOOKING_REQUIRED_KEYWORDS.some(k => text.includes(k))

  // Free — default true, override if paid keywords found
  const isFree = !NOT_FREE_KEYWORDS.some(k => text.includes(k))

  return { category, ageGroup, requiresBooking, isFree }
}
