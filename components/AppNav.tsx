import Link from 'next/link'

export function AppNav() {
  return (
    <nav className="bg-[var(--color-primary)] text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Melbourne Council Explorer
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/councils" className="hover:text-[var(--color-accent)] transition-colors">
            Councils
          </Link>
          <Link href="/events" className="hover:text-[var(--color-accent)] transition-colors">
            Events
          </Link>
          <Link href="/compare" className="hover:text-[var(--color-accent)] transition-colors">
            Compare
          </Link>
        </div>
      </div>
    </nav>
  )
}
