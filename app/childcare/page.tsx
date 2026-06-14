import { prisma } from '@/lib/prisma'
import { ChildcareClient } from './ChildcareClient'

export const metadata = { title: 'Childcare Finder — Australia Council Explorer' }

export default async function ChildcarePage() {
  const total = await prisma.childcare.count({ where: { state: 'VIC' } })

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">👶 Childcare Finder</h1>
        <p className="text-gray-500 text-sm">
          Find childcare centres near you — {total.toLocaleString()} VIC services in our database
        </p>
      </div>

      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        <strong>✅ Data source:</strong> Official{' '}
        <a href="https://www.acecqa.gov.au/resources/national-registers" target="_blank" rel="noopener noreferrer"
          className="underline font-medium">
          ACECQA National Register
        </a>{' '}
        — Australian Government quality ratings, approved places, and operating hours.
        For vacancy status and fees, visit{' '}
        <a href="https://www.startingblocks.gov.au" target="_blank" rel="noopener noreferrer"
          className="underline font-medium">
          Starting Blocks
        </a>.
      </div>

      <ChildcareClient />
    </main>
  )
}
