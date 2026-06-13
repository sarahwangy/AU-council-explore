import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const suburb = decodeURIComponent(name)
  return { title: `${suburb} — Suburb Profile` }
}

function ScoreBar({ score, color = 'bg-blue-500' }: { score: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
    </div>
  )
}

function ScoreCard({ emoji, label, score, count, unit, href, color }: {
  emoji: string; label: string; score: number | null; count: number; unit: string; href: string; color: string
}) {
  return (
    <Link href={href} className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-md transition-all p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{emoji}</span>
        {score !== null
          ? <span className="text-xl font-bold text-gray-900">{score}<span className="text-sm font-normal text-gray-400">/100</span></span>
          : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Coming soon</span>
        }
      </div>
      <p className="font-semibold text-gray-800 text-sm">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{count} {unit}</p>
      {score !== null && <ScoreBar score={score} color={color} />}
    </Link>
  )
}

function distKm(lat: number, lng: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat) * Math.PI) / 180
  const dLng = ((lng2 - lng) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function getSuburbData(suburb: string) {
  const suburbUpper = suburb.toUpperCase()
  const RADIUS = 3 // km
  const DELTA = RADIUS / 111

  // Geocode suburb using Mapbox to get lat/lng
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return null

  const geoRes = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(suburb + ', Victoria, Australia')}.json?access_token=${token}&country=AU&proximity=145.0,-37.8&types=locality,neighborhood&limit=1`,
    { next: { revalidate: 86400 } }
  )
  const geoData = await geoRes.json() as { features?: { center: [number, number]; place_name: string }[] }
  const feature = geoData.features?.[0]
  if (!feature) return null

  const [lng, lat] = feature.center
  const latMin = lat - DELTA, latMax = lat + DELTA
  const lngMin = lng - DELTA, lngMax = lng + DELTA

  const [childcares, playgrounds, hospitals, libraries] = await Promise.all([
    prisma.childcare.findMany({ where: { lat: { gte: latMin, lte: latMax }, lng: { gte: lngMin, lte: lngMax } } }),
    prisma.playground.findMany({ where: { lat: { gte: latMin, lte: latMax }, lng: { gte: lngMin, lte: lngMax } } }),
    prisma.hospital.findMany({ where: { lat: { gte: latMin, lte: latMax }, lng: { gte: lngMin, lte: lngMax } } }),
    prisma.library.findMany({ where: { lat: { gte: latMin, lte: latMax }, lng: { gte: lngMin, lte: lngMax } } }),
  ])

  // Filter to actual radius
  const nearbyChildcare = childcares.filter(c => c.lat && c.lng && distKm(lat, lng, c.lat, c.lng) <= RADIUS)
  const nearbyPlaygrounds = playgrounds.filter(p => distKm(lat, lng, p.lat, p.lng) <= RADIUS)
  const nearbyHospitals = hospitals.filter(h => distKm(lat, lng, h.lat, h.lng) <= RADIUS)
  const nearbyLibraries = libraries.filter(l => l.lat && l.lng && distKm(lat, lng, l.lat!, l.lng!) <= RADIUS)

  // Scores (0–100) — simple density-based
  const childcareScore = Math.min(100, Math.round(nearbyChildcare.length * 8))
  const playgroundScore = Math.min(100, Math.round(nearbyPlaygrounds.length * 5))
  const hospitalScore = nearbyHospitals.length > 0 ? Math.min(100, 50 + nearbyHospitals.length * 10) : 0
  const libraryScore = Math.min(100, nearbyLibraries.length * 25)

  const overallScore = Math.round(
    childcareScore * 0.30 +
    playgroundScore * 0.20 +
    hospitalScore * 0.30 +
    libraryScore * 0.20
  )

  return {
    suburb: feature.place_name.split(',')[0],
    lat, lng,
    nearbyChildcare, nearbyPlaygrounds, nearbyHospitals, nearbyLibraries,
    childcareScore, playgroundScore, hospitalScore, libraryScore, overallScore,
  }
}

export default async function SuburbPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const suburb = decodeURIComponent(name)
  const data = await getSuburbData(suburb)

  if (!data) notFound()

  const scores = [data.childcareScore, data.playgroundScore, data.hospitalScore, data.libraryScore].filter(s => s > 0)
  const overallColor = data.overallScore >= 70 ? 'text-emerald-600' : data.overallScore >= 40 ? 'text-amber-600' : 'text-red-500'

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-1">📍 Suburb Profile · VIC</p>
        <h1 className="text-3xl font-bold text-gray-900">{data.suburb}</h1>
        <p className="text-gray-500 text-sm mt-1">Within 3km radius</p>
      </div>

      {/* Overall score */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Overall Liveability Score</p>
            <p className={`text-5xl font-bold ${overallColor}`}>{data.overallScore}<span className="text-2xl font-normal text-gray-400">/100</span></p>
            <p className="text-xs text-gray-400 mt-1">Based on {scores.length} of 4 dimensions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">🚆 Transit Score</p>
            <p className="text-sm font-medium text-gray-400 mt-1">Coming soon</p>
          </div>
        </div>
        <div className="mt-4 w-full bg-white/60 rounded-full h-3">
          <div className={`h-3 rounded-full ${data.overallScore >= 70 ? 'bg-emerald-500' : data.overallScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${data.overallScore}%` }} />
        </div>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ScoreCard emoji="👶" label="Childcare" score={data.childcareScore}
          count={data.nearbyChildcare.length} unit="centres" href={`/childcare`} color="bg-purple-500" />
        <ScoreCard emoji="🛝" label="Playgrounds" score={data.playgroundScore}
          count={data.nearbyPlaygrounds.length} unit="parks" href={`/playgrounds`} color="bg-green-500" />
        <ScoreCard emoji="🏥" label="Hospitals" score={data.hospitalScore}
          count={data.nearbyHospitals.length} unit="hospitals" href={`/hospitals`} color="bg-red-500" />
        <ScoreCard emoji="📚" label="Libraries" score={data.libraryScore}
          count={data.nearbyLibraries.length} unit="branches" href={`/libraries`} color="bg-blue-500" />
      </div>

      {/* Transit placeholder */}
      <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-5 mb-8 text-center">
        <p className="text-2xl mb-2">🚆</p>
        <p className="font-semibold text-gray-600">Transit Score — Coming Soon</p>
        <p className="text-sm text-gray-400 mt-1">GTFS data integration in progress</p>
      </div>

      {/* Nearest items */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.nearbyChildcare.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-3">👶 Nearest Childcare</h2>
            <div className="space-y-2">
              {data.nearbyChildcare.slice(0, 3).map(c => (
                <div key={c.id} className="bg-white rounded-lg border border-gray-100 p-3 text-sm">
                  <p className="font-medium text-gray-800">{c.name}</p>
                  {c.serviceType && <p className="text-xs text-gray-500">{c.serviceType}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {data.nearbyHospitals.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-3">🏥 Nearest Hospitals</h2>
            <div className="space-y-2">
              {data.nearbyHospitals.slice(0, 3).map(h => (
                <div key={h.id} className="bg-white rounded-lg border border-gray-100 p-3 text-sm">
                  <p className="font-medium text-gray-800">{h.name}</p>
                  {h.emergencyAvailable && <p className="text-xs text-red-600 font-medium">🚨 Emergency</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {data.nearbyLibraries.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-3">📚 Nearest Libraries</h2>
            <div className="space-y-2">
              {data.nearbyLibraries.slice(0, 3).map(l => (
                <div key={l.id} className="bg-white rounded-lg border border-gray-100 p-3 text-sm">
                  <p className="font-medium text-gray-800">{l.name}</p>
                  {l.suburb && <p className="text-xs text-gray-500">{l.suburb}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {data.nearbyPlaygrounds.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-3">🛝 Nearest Playgrounds</h2>
            <div className="space-y-2">
              {data.nearbyPlaygrounds.slice(0, 3).map(p => (
                <div key={p.id} className="bg-white rounded-lg border border-gray-100 p-3 text-sm">
                  <p className="font-medium text-gray-800">{p.name ?? 'Unnamed Playground'}</p>
                  {p.suburb && <p className="text-xs text-gray-500">{p.suburb}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link href="/childcare" className="text-sm text-purple-600 hover:underline mr-4">👶 Childcare Finder</Link>
        <Link href="/playgrounds" className="text-sm text-green-600 hover:underline mr-4">🛝 Playground Finder</Link>
        <Link href="/hospitals" className="text-sm text-red-600 hover:underline">🏥 Hospital Finder</Link>
      </div>
    </main>
  )
}
