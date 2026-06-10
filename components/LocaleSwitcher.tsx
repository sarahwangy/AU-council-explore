'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const LABELS: Record<string, string> = { en: 'EN', zh: '中文' }

export function LocaleSwitcher({ current }: { current: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    const next = current === 'en' ? 'zh' : 'en'
    document.cookie = `locale=${next}; path=/; max-age=31536000`
    startTransition(() => router.refresh())
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="text-sm opacity-80 hover:opacity-100 transition-opacity disabled:opacity-50 border border-white/30 rounded px-2 py-0.5"
    >
      {current === 'en' ? LABELS.zh : LABELS.en}
    </button>
  )
}
