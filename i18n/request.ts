import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import en from '../messages/en.json'
import zh from '../messages/zh.json'

export const LOCALES = ['en', 'zh'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

const MESSAGES = { en, zh }

export default getRequestConfig(async () => {
  const store = await cookies()
  const raw = store.get('locale')?.value ?? DEFAULT_LOCALE
  const locale = (LOCALES as readonly string[]).includes(raw) ? raw as Locale : DEFAULT_LOCALE

  return {
    locale,
    messages: MESSAGES[locale],
  }
})
