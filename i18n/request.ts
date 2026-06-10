import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

export const LOCALES = ['en', 'zh'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export default getRequestConfig(async () => {
  const store = await cookies()
  const raw = store.get('locale')?.value ?? DEFAULT_LOCALE
  const locale = (LOCALES as readonly string[]).includes(raw) ? raw : DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
