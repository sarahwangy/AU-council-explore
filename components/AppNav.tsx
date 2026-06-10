import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'

export function AppNav({ locale }: { locale: string }) {
  const t = useTranslations('nav')

  return (
    <nav className="bg-(--color-primary) text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          {t('title')}
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/councils" className="hover:text-(--color-accent) transition-colors">
            {t('councils')}
          </Link>
          <Link href="/events" className="hover:text-(--color-accent) transition-colors">
            {t('events')}
          </Link>
          <Link href="/compare" className="hover:text-(--color-accent) transition-colors">
            {t('compare')}
          </Link>
          <Link href="/my-events" className="hover:text-(--color-accent) transition-colors">
            ★ {t('myEvents')}
          </Link>
          <LocaleSwitcher current={locale} />
        </div>
      </div>
    </nav>
  )
}
