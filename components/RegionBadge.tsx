const REGION_COLORS: Record<string, string> = {
  inner: 'bg-purple-100 text-purple-800',
  eastern: 'bg-blue-100 text-blue-800',
  southern: 'bg-green-100 text-green-800',
  northern: 'bg-orange-100 text-orange-800',
  western: 'bg-red-100 text-red-800',
  outer: 'bg-gray-100 text-gray-700',
}

const REGION_LABELS: Record<string, string> = {
  inner: 'Inner', eastern: 'East', southern: 'South',
  northern: 'North', western: 'West', outer: 'Outer',
}

export function RegionBadge({ region }: { region: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${REGION_COLORS[region] ?? 'bg-gray-100 text-gray-700'}`}>
      {REGION_LABELS[region] ?? region}
    </span>
  )
}
