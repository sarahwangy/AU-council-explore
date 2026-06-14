import { prisma } from '@/lib/prisma'
import { PlaygroundClient } from './PlaygroundClient'

export const metadata = { title: 'Playground Finder — Australia Council Explorer' }

export default async function PlaygroundsPage() {
  const total = await prisma.playground.count({ where: { state: 'VIC' } })

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">🛝 Playground Finder</h1>
        <p className="text-gray-500 text-sm">
          Find playgrounds near you — {total.toLocaleString()} VIC playgrounds in our database
        </p>
      </div>
      <PlaygroundClient />
    </main>
  )
}
