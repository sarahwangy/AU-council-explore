'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'

export function AppNav({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const navLink = (href: string, label: string) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
    return (
      <Link
        href={href}
        className={`transition-colors ${
          active
            ? 'text-(--color-accent) font-semibold underline underline-offset-4'
            : 'opacity-80 hover:opacity-100 hover:text-(--color-accent)'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-(--color-primary) text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          {t('title')}
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {navLink('/', t('map'))}
          {navLink('/councils', t('councils'))}
          {navLink('/events', t('events'))}
          {navLink('/compare', t('compare'))}
          {navLink('/libraries', t('libraries'))}
          {navLink('/schools', t('schools'))}
          {navLink('/states', t('states'))}
          {navLink('/my-events', `★ ${t('myEvents')}`)  }
          <Link
            href="/search"
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
              pathname.startsWith('/search')
                ? 'bg-white/20 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white/90'
            }`}
          >
            ✨ AI
          </Link>
          <LocaleSwitcher current={locale} />
        </div>
      </div>
    </nav>
  )
}
