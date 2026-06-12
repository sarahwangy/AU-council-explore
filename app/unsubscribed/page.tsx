import Link from 'next/link'

export default function UnsubscribedPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">👋</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">You&apos;ve unsubscribed</h1>
      <p className="text-gray-500 mb-8">You won&apos;t receive any more weekly digests from Melbourne Council Explorer.</p>
      <Link href="/" className="text-sm text-(--color-primary) underline">Back to home</Link>
    </main>
  )
}
