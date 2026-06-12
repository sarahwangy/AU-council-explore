'use client'
import { useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'

export function SubscribeForm() {
  const { favorites } = useFavorites()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const councils = favorites.councils

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || councils.length === 0) return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, councils }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed')
      }
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-semibold text-green-800">You&apos;re subscribed!</p>
        <p className="text-green-600 text-sm mt-1">
          Weekly digest will be sent to <strong>{email}</strong>
        </p>
      </div>
    )
  }

  if (councils.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <p className="text-amber-700 text-sm">
          ★ Add favourite councils first, then subscribe to their weekly events digest.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-1">📬 Weekly Events Digest</h3>
      <p className="text-gray-500 text-sm mb-4">
        Get upcoming events from your {councils.length} favourite council{councils.length > 1 ? 's' : ''} every Monday.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-(--color-primary)"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-(--color-primary) rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      <p className="text-gray-400 text-xs mt-3">No spam. Unsubscribe anytime.</p>
    </div>
  )
}
