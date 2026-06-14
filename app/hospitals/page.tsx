import { prisma } from '@/lib/prisma'
import { HospitalClient } from './HospitalClient'

export const metadata = { title: 'Hospital Finder — Australia Council Explorer' }

export default async function HospitalsPage() {
  const [total, emergency] = await Promise.all([
    prisma.hospital.count({ where: { state: 'VIC' } }),
    prisma.hospital.count({ where: { state: 'VIC', emergencyAvailable: true } }),
  ])

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">🏥 Hospital Finder</h1>
        <p className="text-gray-500 text-sm">
          {total} VIC hospitals in database · {emergency} with emergency departments
        </p>
      </div>

      <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
        <strong>⚠️ Emergency?</strong> Call <strong>000</strong> immediately.
        This tool is for planning purposes only — always verify hospital capabilities before visiting.
      </div>

      <HospitalClient />
    </main>
  )
}
