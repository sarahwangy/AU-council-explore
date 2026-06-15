'use client'
import { useState } from 'react'

interface Source {
  name: string
  url: string
  description: string
}

interface SubGroup {
  label: string
  sources: Source[]
}

interface Section {
  category: string
  emoji: string
  color: string
  border: string
  badge: string
  sources?: Source[]
  subGroups?: SubGroup[]
}

const SECTIONS: Section[] = [
  {
    category: 'Childcare',
    emoji: '👶',
    color: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    sources: [
      { name: 'ACECQA National Register', url: 'https://www.acecqa.gov.au/resources/national-registers', description: 'Official Australian Government register of approved childcare services, quality ratings, and operating hours.' },
      { name: 'Starting Blocks (Dept. of Education)', url: 'https://www.startingblocks.gov.au', description: 'Australian Government portal for finding early childhood education and care.' },
    ],
  },
  {
    category: 'Hospitals',
    emoji: '🏥',
    color: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    sources: [
      { name: 'OpenStreetMap — Hospitals (amenity=hospital)', url: 'https://www.openstreetmap.org', description: 'Community-maintained map data including hospital locations, types, and emergency department availability across VIC.' },
      { name: 'Health Direct — GP & Clinic Finder', url: 'https://www.healthdirect.gov.au/gp-clinics', description: 'Australian Government health service directory (referenced for future integration).' },
    ],
  },
  {
    category: 'Playgrounds',
    emoji: '🛝',
    color: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    sources: [
      { name: 'OpenStreetMap — Playgrounds (leisure=playground)', url: 'https://www.openstreetmap.org', description: 'Community-sourced playground locations with features including fencing, shade, BBQ facilities, toilets, and surface types.' },
      { name: 'Nominatim (OSM Geocoding)', url: 'https://nominatim.openstreetmap.org', description: 'OSM reverse geocoding service used to enrich unnamed playground records with location names.' },
    ],
  },
  {
    category: 'Libraries',
    emoji: '📚',
    color: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    subGroups: [
      {
        label: 'Data Infrastructure',
        sources: [
          { name: 'OpenStreetMap — Libraries (amenity=library)', url: 'https://www.openstreetmap.org', description: 'Community-maintained library locations and details across all Australian states.' },
          { name: 'Victorian Local Government Areas (Data Vic)', url: 'https://discover.data.vic.gov.au/dataset/victorian-local-government-areas-lgas', description: 'Official VIC council boundary data used for library-to-council association.' },
          { name: 'MyLibrary Digital (event feeds)', url: 'https://bayside.events.mylibrary.digital', description: 'Library event management platform used by Bayside, Hume, Monash, Stonnington and other VIC councils.' },
        ],
      },
      {
        label: 'VIC — Victoria',
        sources: [
          { name: 'Brimbank Libraries', url: 'https://brimbanklibraries.vic.gov.au', description: 'Brimbank council library network.' },
          { name: 'Frankston Library', url: 'https://library.frankston.vic.gov.au', description: 'Frankston council library network.' },
          { name: 'Ballarat Libraries', url: 'https://libraries.ballarat.vic.gov.au', description: 'City of Ballarat library network.' },
          { name: 'North Central Goldfields Regional Library', url: 'https://www.ncgrl.vic.gov.au', description: 'Regional library serving Bendigo and surrounds.' },
          { name: 'Connected Libraries', url: 'https://www.connectedlibraries.org.au', description: 'Maroondah, Yarra Ranges and Lilydale libraries.' },
          { name: 'Darebin Libraries', url: 'https://libraries.darebin.vic.gov.au', description: 'Darebin council library network.' },
          { name: 'Greater Dandenong Libraries', url: 'https://libraries.greaterdandenong.vic.gov.au', description: 'Greater Dandenong library network.' },
          { name: 'Hobsons Bay Libraries', url: 'https://libraries.hobsonsbay.vic.gov.au', description: 'Hobsons Bay council library network.' },
          { name: 'Wyndham Libraries', url: 'https://www.wyndham.vic.gov.au/services/libraries', description: 'Wyndham council library network.' },
          { name: 'Goulburn Regional Library', url: 'https://www.grlc.vic.gov.au', description: 'Goulburn Regional Library Corporation.' },
          { name: 'Glen Eira Library', url: 'https://library.gleneira.vic.gov.au', description: 'Glen Eira council library network.' },
          { name: 'Kingston Library', url: 'https://library.kingston.vic.gov.au', description: 'Kingston council library network.' },
          { name: 'Mornington Peninsula Library', url: 'https://library.mornpen.vic.gov.au', description: 'Mornington Peninsula library network.' },
          { name: 'Port Phillip Library', url: 'https://library.portphillip.vic.gov.au', description: 'City of Port Phillip library network.' },
          { name: 'Monash Library', url: 'https://www.monlib.vic.gov.au', description: 'Monash council library network.' },
          { name: 'Manningham Library (MVCC)', url: 'https://libraries.mvcc.vic.gov.au', description: 'Manningham council library network.' },
          { name: 'Hume Libraries', url: 'https://www.humelibraries.vic.gov.au', description: 'Hume council library network.' },
          { name: 'Melton Library', url: 'https://www.melton.vic.gov.au', description: 'Melton council library network.' },
          { name: 'Your Library (Nillumbik/Whittlesea)', url: 'https://www.yourlibrary.vic.gov.au', description: 'Nillumbik and Whittlesea library network.' },
          { name: 'Yarra Plenty Regional Library', url: 'https://www.yprl.vic.gov.au', description: 'Banyule, Nillumbik and Whittlesea libraries.' },
          { name: 'Bayside Library', url: 'https://www.bayside.vic.gov.au/services/libraries', description: 'Bayside council library network.' },
          { name: 'Boroondara Libraries', url: 'https://www.boroondara.vic.gov.au', description: 'Boroondara council library network.' },
          { name: 'Casey Library', url: 'https://www.casey.vic.gov.au', description: 'City of Casey library network.' },
          { name: 'Stonnington Library', url: 'https://www.stonnington.vic.gov.au', description: 'Stonnington council library network.' },
          { name: 'Maribyrnong Library', url: 'https://www.maribyrnong.vic.gov.au', description: 'Maribyrnong council library network.' },
          { name: 'Melbourne Library', url: 'https://www.melbourne.vic.gov.au', description: 'City of Melbourne library network.' },
          { name: 'Merri-bek Library', url: 'https://www.merri-bek.vic.gov.au', description: 'Merri-bek (Moreland) council library network.' },
          { name: 'Yarra Library', url: 'https://www.yarracity.vic.gov.au', description: 'City of Yarra library network.' },
          { name: 'Wimmera Mallee Library (WML)', url: 'https://www.wml.vic.gov.au', description: 'Wimmera Mallee regional library.' },
        ],
      },
      {
        label: 'NSW — New South Wales',
        sources: [
          { name: 'City of Sydney Library', url: 'https://library.cityofsydney.nsw.gov.au', description: 'City of Sydney library network.' },
          { name: 'Lane Cove Library', url: 'https://lanecove.nsw.gov.au/community/libraries', description: 'Lane Cove council library.' },
          { name: 'Mosman Library', url: 'https://mosman.nsw.gov.au/library', description: 'Mosman council library.' },
          { name: 'Newcastle Library', url: 'https://newcastle.nsw.gov.au/library', description: 'City of Newcastle library network.' },
          { name: 'Blacktown Library', url: 'https://www.blacktown.nsw.gov.au/Services/Libraries-and-Reading', description: 'Blacktown council library network.' },
          { name: 'Wollongong Library', url: 'https://library.wollongong.nsw.gov.au', description: 'Wollongong council library network.' },
          { name: 'City of Parramatta Library', url: 'https://www.cityofparramatta.nsw.gov.au', description: 'City of Parramatta library network.' },
          { name: 'Georges River Library', url: 'https://www.georgesriver.nsw.gov.au', description: 'Georges River council library network.' },
          { name: 'Lake Macquarie Library', url: 'https://lakemac.com.au/library', description: 'Lake Macquarie council library.' },
          { name: 'North Sydney Library', url: 'https://www.northsydney.nsw.gov.au', description: 'North Sydney council library.' },
          { name: 'Waverley Library', url: 'https://www.waverley.nsw.gov.au', description: 'Waverley council library.' },
          { name: 'Inner West Library', url: 'https://www.innerwest.nsw.gov.au', description: 'Inner West council library network.' },
        ],
      },
      {
        label: 'QLD — Queensland',
        sources: [
          { name: 'Brisbane City Libraries', url: 'https://www.brisbane.qld.gov.au', description: 'Brisbane City Council library network.' },
          { name: 'Gold Coast Library', url: 'https://www.goldcoast.qld.gov.au', description: 'Gold Coast council library network.' },
          { name: 'Sunshine Coast Library', url: 'https://library.sunshinecoast.qld.gov.au', description: 'Sunshine Coast council library network.' },
          { name: 'Logan Library', url: 'https://www.logan.qld.gov.au', description: 'Logan council library network.' },
          { name: 'Townsville Library', url: 'https://www.townsville.qld.gov.au', description: 'Townsville council library network.' },
          { name: 'Cairns Library', url: 'https://www.cairns.qld.gov.au', description: 'Cairns Regional Council library.' },
          { name: 'Ipswich Library', url: 'https://www.ipswich.qld.gov.au', description: 'Ipswich council library network.' },
          { name: 'Moreton Bay Library', url: 'https://www.moretonbay.qld.gov.au', description: 'Moreton Bay council library network.' },
        ],
      },
      {
        label: 'WA — Western Australia',
        sources: [
          { name: 'City of Perth Library', url: 'https://www.perth.wa.gov.au', description: 'City of Perth library network.' },
          { name: 'Fremantle Library', url: 'https://www.fremantle.wa.gov.au', description: 'City of Fremantle library network.' },
          { name: 'Joondalup Library', url: 'https://www.joondalup.wa.gov.au', description: 'City of Joondalup library network.' },
          { name: 'Stirling Library', url: 'https://www.stirling.wa.gov.au', description: 'City of Stirling library network.' },
          { name: 'Mandurah Library', url: 'https://www.mandurah.wa.gov.au', description: 'City of Mandurah library network.' },
          { name: 'Rockingham Library', url: 'https://www.rockingham.wa.gov.au', description: 'City of Rockingham library network.' },
        ],
      },
      {
        label: 'SA — South Australia',
        sources: [
          { name: 'City of Adelaide Library', url: 'https://www.cityofadelaide.com.au', description: 'City of Adelaide library network.' },
          { name: 'Salisbury Library', url: 'https://www.salisbury.sa.gov.au', description: 'City of Salisbury library.' },
          { name: 'Charles Sturt Library', url: 'https://www.charlessturt.sa.gov.au', description: 'City of Charles Sturt library.' },
          { name: 'Onkaparinga Library', url: 'https://www.onkaparingacity.com', description: 'City of Onkaparinga library network.' },
          { name: 'Playford Library', url: 'https://www.playford.sa.gov.au', description: 'City of Playford library.' },
        ],
      },
      {
        label: 'TAS — Tasmania',
        sources: [
          { name: 'Libraries Tasmania', url: 'https://libraries.tas.gov.au', description: 'State-wide library network.' },
          { name: 'Launceston Library', url: 'https://www.launceston.tas.gov.au', description: 'Launceston council library.' },
          { name: 'Devonport Library', url: 'https://www.devonport.tas.gov.au', description: 'Devonport council library.' },
        ],
      },
      {
        label: 'NT — Northern Territory',
        sources: [
          { name: 'Darwin Library', url: 'https://www.darwin.nt.gov.au', description: 'Darwin council library network.' },
          { name: 'Alice Springs Library', url: 'https://www.alicesprings.nt.gov.au/residents/facilities/library', description: 'Alice Springs council library.' },
          { name: 'Palmerston Library', url: 'https://www.palmerston.nt.gov.au', description: 'City of Palmerston library.' },
        ],
      },
      {
        label: 'ACT — Australian Capital Territory',
        sources: [
          { name: 'ACT Public Libraries', url: 'https://www.library.act.gov.au', description: 'ACT public library network.' },
        ],
      },
    ],
  },
  {
    category: 'Schools',
    emoji: '🏫',
    color: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    sources: [
      { name: 'OpenStreetMap — Schools (amenity=school)', url: 'https://www.openstreetmap.org', description: 'Community-sourced school locations across VIC, NSW, QLD and other Australian states.' },
      { name: 'ABS Geographic Boundaries', url: 'https://geo.abs.gov.au', description: 'Australian Bureau of Statistics geographic data used for suburb and state boundary calculations.' },
    ],
  },
  {
    category: 'Events',
    emoji: '📅',
    color: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    sources: [
      { name: 'Eventbrite', url: 'https://www.eventbrite.com.au', description: 'Public event listings scraped via Eventbrite API for local community events.' },
      { name: 'Humanitix', url: 'https://humanitix.com/au', description: 'Ethical ticketing platform — event listings for Australian councils and community organisations.' },
      { name: 'MyLibrary Digital', url: 'https://bayside.events.mylibrary.digital', description: 'Library event management platform used by multiple Victorian councils.' },
    ],
  },
  {
    category: 'Maps & Geocoding',
    emoji: '🗺️',
    color: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
    sources: [
      { name: 'Mapbox', url: 'https://www.mapbox.com', description: 'Map tiles, geocoding (suburb/address search), and reverse geocoding used across all finder pages.' },
      { name: 'OpenStreetMap Contributors', url: 'https://www.openstreetmap.org/copyright', description: '© OpenStreetMap contributors — base map data underlying all location features.' },
      { name: 'Nominatim', url: 'https://nominatim.openstreetmap.org', description: 'OSM reverse geocoding used to look up place names from coordinates.' },
    ],
  },
  {
    category: 'Councils & Government',
    emoji: '🏛️',
    color: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    sources: [
      { name: 'Australian Electoral Commission — Enrol to Vote', url: 'https://www.aec.gov.au/enrol/', description: 'Linked from council profiles to help residents enrol to vote.' },
    ],
  },
]

function downloadCSV(sources: Source[], filename: string) {
  const header = 'Name,URL,Description'
  const rows = sources.map(s =>
    `"${s.name.replace(/"/g, '""')}","${s.url}","${s.description.replace(/"/g, '""')}"`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function SourceCard({ source }: { source: Source }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <a href={source.url} target="_blank" rel="noopener noreferrer"
          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm">
          {source.name} ↗
        </a>
        <p className="text-xs text-gray-500 mt-0.5">{source.description}</p>
      </div>
      <span className="text-xs text-gray-300 shrink-0 font-mono hidden sm:block truncate max-w-40">
        {source.url.replace('https://', '').split('/')[0]}
      </span>
    </div>
  )
}

function AccordionGroup({ group, defaultOpen }: { group: SubGroup; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{group.label}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{group.sources.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); downloadCSV(group.sources, `${group.label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`) }}
            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors font-medium"
            title="Download as CSV"
          >
            ↓ CSV
          </button>
          <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 p-3 space-y-2 bg-gray-50/50">
          {group.sources.map(s => <SourceCard key={s.url} source={s} />)}
        </div>
      )}
    </div>
  )
}

export function SourcesClient() {
  const allSources = SECTIONS.flatMap(s => [
    ...(s.sources ?? []),
    ...(s.subGroups?.flatMap(g => g.sources) ?? []),
  ])

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Sources</h1>
          <p className="text-gray-500 text-base max-w-2xl">
            Australia Council Explorer is built on open government data, community-maintained datasets, and official registers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCSV(allSources, 'australia-council-explorer-all-sources.csv')}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          ↓ Download All Sources (CSV)
        </button>
      </div>

      <div className="space-y-8">
        {SECTIONS.map(section => {
          const totalCount = section.sources?.length
            ?? section.subGroups?.reduce((sum, g) => sum + g.sources.length, 0)
            ?? 0
          const flatSources = [...(section.sources ?? []), ...(section.subGroups?.flatMap(g => g.sources) ?? [])]

          return (
            <div key={section.category} className={`rounded-2xl border ${section.border} ${section.color} p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{section.emoji}</span>
                <h2 className="text-lg font-bold text-gray-900">{section.category}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${section.badge}`}>
                  {totalCount} source{totalCount !== 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => downloadCSV(flatSources, `${section.category.toLowerCase()}-sources.csv`)}
                  className="ml-auto text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors font-medium"
                  title={`Download ${section.category} sources as CSV`}
                >
                  ↓ CSV
                </button>
              </div>

              {/* Flat list */}
              {section.sources && (
                <div className="space-y-2">
                  {section.sources.map(s => <SourceCard key={s.url} source={s} />)}
                </div>
              )}

              {/* Accordion by state */}
              {section.subGroups && (
                <div className="space-y-2">
                  {section.subGroups.map((group, i) => (
                    <AccordionGroup key={group.label} group={group} defaultOpen={i === 0} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
        All data is used for informational purposes only. We do not store or redistribute raw data beyond what is necessary to power search features.
      </div>
    </main>
  )
}
