'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useRef, useEffect } from 'react'
import { LocaleSwitcher } from './LocaleSwitcher'

export function AppNav({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [liveabilityOpen, setLiveabilityOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLiveabilityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLink = (href: string, label: string) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
    return (
      <Link
        href={href}
        className={`whitespace-nowrap transition-colors ${
          active
            ? 'text-(--color-accent) font-semibold underline underline-offset-4'
            : 'opacity-80 hover:opacity-100 hover:text-(--color-accent)'
        }`}
      >
        {label}
      </Link>
    )
  }

  const liveabilityActive = ['/childcare', '/playgrounds', '/hospitals'].some(p => pathname.startsWith(p))

  return (
    <nav className="bg-(--color-primary) text-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight shrink-0">
          {t('title')}
        </Link>
        <div className="flex items-center gap-4 text-sm flex-nowrap ml-4">
          {navLink('/', t('map'))}
          {navLink('/councils', t('councils'))}
          {navLink('/events', t('events'))}
          {navLink('/compare', t('compare'))}
          {navLink('/libraries', t('libraries'))}
          {navLink('/schools', t('schools'))}

          {/* Liveability dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLiveabilityOpen(v => !v)}
              className={`whitespace-nowrap flex items-center gap-1 transition-colors ${
                liveabilityActive
                  ? 'text-(--color-accent) font-semibold underline underline-offset-4'
                  : 'opacity-80 hover:opacity-100 hover:text-(--color-accent)'
              }`}
            >
              Liveability <span className="text-xs opacity-70">{liveabilityOpen ? '▴' : '▾'}</span>
            </button>
            {liveabilityOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-40 z-50">
                {[
                  { href: '/childcare', label: '👶 Childcare' },
                  { href: '/playgrounds', label: '🛝 Playgrounds' },
                  { href: '/hospitals', label: '🏥 Hospitals' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setLiveabilityOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      pathname.startsWith(item.href)
                        ? 'text-purple-700 font-semibold bg-purple-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/my-events"
            className={`whitespace-nowrap transition-colors ${
              pathname.startsWith('/my-events')
                ? 'text-(--color-accent) font-semibold underline underline-offset-4'
                : 'opacity-80 hover:opacity-100 hover:text-(--color-accent)'
            }`}
          >
            ★ {t('myEvents')}
          </Link>
          {navLink('/states', t('states'))}
          {navLink('/sources', 'Sources')}
          <Link
            href="/search"
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
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
