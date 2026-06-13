import { PrismaClient } from '../node_modules/.prisma/client'

const prisma = new PrismaClient()

type LibraryCoord = { councilId: string; nameContains: string; lat: number; lng: number }

const coords: LibraryCoord[] = [
  // Banyule
  { councilId: 'banyule', nameContains: 'Ivanhoe', lat: -37.770, lng: 145.044 },
  { councilId: 'banyule', nameContains: 'Rosanna', lat: -37.754, lng: 145.066 },
  { councilId: 'banyule', nameContains: 'Watsonia', lat: -37.717, lng: 145.083 },
  // Bayside
  { councilId: 'bayside', nameContains: 'Beaumaris', lat: -37.989, lng: 145.043 },
  { councilId: 'bayside', nameContains: 'Brighton', lat: -37.905, lng: 144.987 },
  { councilId: 'bayside', nameContains: 'Hampton', lat: -37.934, lng: 145.003 },
  { councilId: 'bayside', nameContains: 'Sandringham', lat: -37.950, lng: 145.000 },
  // Boroondara
  { councilId: 'boroondara', nameContains: 'Ashburton', lat: -37.874, lng: 145.073 },
  { councilId: 'boroondara', nameContains: 'Balwyn', lat: -37.806, lng: 145.084 },
  { councilId: 'boroondara', nameContains: 'Camberwell', lat: -37.824, lng: 145.066 },
  { councilId: 'boroondara', nameContains: 'Greythorn', lat: -37.801, lng: 145.083 },
  { councilId: 'boroondara', nameContains: 'Hawthorn', lat: -37.822, lng: 145.031 },
  { councilId: 'boroondara', nameContains: 'Kew', lat: -37.806, lng: 145.025 },
  // Brimbank
  { councilId: 'brimbank', nameContains: 'Deer Park', lat: -37.773, lng: 144.784 },
  { councilId: 'brimbank', nameContains: 'Keilor', lat: -37.722, lng: 144.844 },
  { councilId: 'brimbank', nameContains: 'St Albans', lat: -37.747, lng: 144.800 },
  { councilId: 'brimbank', nameContains: 'Sunshine', lat: -37.787, lng: 144.830 },
  { councilId: 'brimbank', nameContains: 'Sydenham', lat: -37.698, lng: 144.769 },
  // Cardinia
  { councilId: 'cardinia', nameContains: 'Emerald', lat: -37.929, lng: 145.434 },
  { councilId: 'cardinia', nameContains: 'Pakenham', lat: -38.069, lng: 145.489 },
  // Casey
  { councilId: 'casey', nameContains: 'Bunjil', lat: -37.960, lng: 145.264 },
  { councilId: 'casey', nameContains: 'Cranbourne', lat: -38.113, lng: 145.283 },
  { councilId: 'casey', nameContains: 'Doveton', lat: -37.965, lng: 145.243 },
  { councilId: 'casey', nameContains: 'Endeavour Hills', lat: -37.951, lng: 145.266 },
  { councilId: 'casey', nameContains: 'Hampton Park', lat: -37.998, lng: 145.264 },
  // Darebin
  { councilId: 'darebin', nameContains: 'Fairfield', lat: -37.773, lng: 145.009 },
  { councilId: 'darebin', nameContains: 'Northcote', lat: -37.773, lng: 145.010 },
  { councilId: 'darebin', nameContains: 'Preston', lat: -37.745, lng: 145.009 },
  { councilId: 'darebin', nameContains: 'Reservoir', lat: -37.717, lng: 145.000 },
  // Frankston
  { councilId: 'frankston', nameContains: 'Carrum Downs', lat: -38.094, lng: 145.169 },
  { councilId: 'frankston', nameContains: 'Frankston', lat: -38.145, lng: 145.125 },
  { councilId: 'frankston', nameContains: 'Seaford', lat: -38.106, lng: 145.132 },
  // Glen Eira
  { councilId: 'glen-eira', nameContains: 'Bentleigh', lat: -37.924, lng: 145.032 },
  { councilId: 'glen-eira', nameContains: 'Carnegie', lat: -37.892, lng: 145.052 },
  { councilId: 'glen-eira', nameContains: 'Caulfield', lat: -37.877, lng: 145.015 },
  { councilId: 'glen-eira', nameContains: 'Elsternwick', lat: -37.885, lng: 144.998 },
  // Greater Dandenong
  { councilId: 'greater-dandenong', nameContains: 'Dandenong', lat: -37.987, lng: 145.215 },
  { councilId: 'greater-dandenong', nameContains: 'Keysborough', lat: -37.988, lng: 145.169 },
  { councilId: 'greater-dandenong', nameContains: 'Springvale', lat: -37.950, lng: 145.148 },
  // Hobsons Bay
  { councilId: 'hobsons-bay', nameContains: 'Altona Meadows', lat: -37.888, lng: 144.814 },
  { councilId: 'hobsons-bay', nameContains: 'Altona North', lat: -37.851, lng: 144.844 },
  // "Altona Library" — matched by id directly to avoid matching Altona Meadows / Altona North
  { councilId: 'hobsons-bay', nameContains: 'Altona Library', lat: -37.869, lng: 144.833 },
  { councilId: 'hobsons-bay', nameContains: 'Williamstown', lat: -37.858, lng: 144.899 },
  // Hume
  { councilId: 'hume', nameContains: 'Broadmeadows', lat: -37.686, lng: 144.921 },
  { councilId: 'hume', nameContains: 'Craigieburn', lat: -37.604, lng: 144.939 },
  { councilId: 'hume', nameContains: 'Gladstone Park', lat: -37.695, lng: 144.889 },
  { councilId: 'hume', nameContains: 'Sunbury', lat: -37.576, lng: 144.728 },
  { councilId: 'hume', nameContains: 'Tullamarine', lat: -37.703, lng: 144.884 },
  // Kingston
  { councilId: 'kingston', nameContains: 'Chelsea', lat: -38.047, lng: 145.121 },
  { councilId: 'kingston', nameContains: 'Cheltenham', lat: -37.952, lng: 145.060 },
  { councilId: 'kingston', nameContains: 'Clarinda', lat: -37.935, lng: 145.068 },
  { councilId: 'kingston', nameContains: 'Dingley', lat: -37.973, lng: 145.122 },
  { councilId: 'kingston', nameContains: 'Highett', lat: -37.960, lng: 145.043 },
  { councilId: 'kingston', nameContains: 'Parkdale', lat: -38.004, lng: 145.093 },
  { councilId: 'kingston', nameContains: 'Patterson Lakes', lat: -38.083, lng: 145.120 },
  { councilId: 'kingston', nameContains: 'Westall', lat: -37.940, lng: 145.082 },
  // Knox
  { councilId: 'knox', nameContains: 'Bayswater', lat: -37.843, lng: 145.267 },
  { councilId: 'knox', nameContains: 'Boronia', lat: -37.859, lng: 145.284 },
  { councilId: 'knox', nameContains: 'Ferntree Gully', lat: -37.880, lng: 145.295 },
  { councilId: 'knox', nameContains: 'Ngarrgoo', lat: -37.868, lng: 145.248 },
  { councilId: 'knox', nameContains: 'Rowville', lat: -37.930, lng: 145.231 },
  // Manningham
  { councilId: 'manningham', nameContains: 'Bulleen', lat: -37.779, lng: 145.082 },
  { councilId: 'manningham', nameContains: 'Doncaster', lat: -37.787, lng: 145.124 },
  { councilId: 'manningham', nameContains: 'The Pines', lat: -37.731, lng: 145.173 },
  { councilId: 'manningham', nameContains: 'Warrandyte', lat: -37.747, lng: 145.223 },
  // Maribyrnong
  { councilId: 'maribyrnong', nameContains: 'Braybrook', lat: -37.790, lng: 144.853 },
  { councilId: 'maribyrnong', nameContains: 'Footscray Library', lat: -37.801, lng: 144.899 },
  { councilId: 'maribyrnong', nameContains: 'Maribyrnong Library', lat: -37.779, lng: 144.889 },
  { councilId: 'maribyrnong', nameContains: 'West Footscray', lat: -37.804, lng: 144.881 },
  { councilId: 'maribyrnong', nameContains: 'Yarraville', lat: -37.814, lng: 144.886 },
  // Maroondah
  { councilId: 'maroondah', nameContains: 'Croydon', lat: -37.796, lng: 145.282 },
  { councilId: 'maroondah', nameContains: 'Realm', lat: -37.818, lng: 145.232 },
  // Melbourne
  { councilId: 'melbourne', nameContains: 'City Library', lat: -37.811, lng: 144.965 },
  { councilId: 'melbourne', nameContains: 'East Melbourne', lat: -37.820, lng: 144.982 },
  { councilId: 'melbourne', nameContains: 'Kathleen Syme', lat: -37.784, lng: 144.972 },
  { councilId: 'melbourne', nameContains: 'Dock', lat: -37.822, lng: 144.949 },
  { councilId: 'melbourne', nameContains: 'Narrm', lat: -37.812, lng: 144.964 },
  { councilId: 'melbourne', nameContains: 'North Melbourne', lat: -37.795, lng: 144.950 },
  { councilId: 'melbourne', nameContains: 'Southbank', lat: -37.825, lng: 144.966 },
  // Melton
  { councilId: 'melton', nameContains: 'Caroline Springs', lat: -37.733, lng: 144.740 },
  { councilId: 'melton', nameContains: 'Melton', lat: -37.685, lng: 144.580 },
  // Merri-bek
  { councilId: 'merri-bek', nameContains: 'Brunswick Library', lat: -37.766, lng: 144.960 },
  { councilId: 'merri-bek', nameContains: 'Campbell Turnbull', lat: -37.704, lng: 144.917 },
  { councilId: 'merri-bek', nameContains: 'Coburg', lat: -37.745, lng: 144.966 },
  { councilId: 'merri-bek', nameContains: 'Fawkner', lat: -37.714, lng: 144.978 },
  { councilId: 'merri-bek', nameContains: 'Glenroy', lat: -37.704, lng: 144.917 },
  // Monash
  { councilId: 'monash', nameContains: 'Clayton', lat: -37.919, lng: 145.123 },
  { councilId: 'monash', nameContains: 'Glen Waverley', lat: -37.877, lng: 145.163 },
  { councilId: 'monash', nameContains: 'Mount Waverley', lat: -37.882, lng: 145.131 },
  { councilId: 'monash', nameContains: 'Mulgrave', lat: -37.929, lng: 145.173 },
  { councilId: 'monash', nameContains: 'Oakleigh', lat: -37.899, lng: 145.085 },
  { councilId: 'monash', nameContains: 'Wheelers Hill', lat: -37.900, lng: 145.196 },
  // Moonee Valley
  { councilId: 'moonee-valley', nameContains: 'Ascot Vale', lat: -37.785, lng: 144.924 },
  { councilId: 'moonee-valley', nameContains: 'Avondale Heights', lat: -37.773, lng: 144.862 },
  { councilId: 'moonee-valley', nameContains: 'Flemington', lat: -37.789, lng: 144.938 },
  { councilId: 'moonee-valley', nameContains: 'Niddrie', lat: -37.736, lng: 144.887 },
  { councilId: 'moonee-valley', nameContains: 'Sam Merrifield', lat: -37.749, lng: 144.924 },
  // Mornington Peninsula
  { councilId: 'mornington-peninsula', nameContains: 'Hastings', lat: -38.298, lng: 145.185 },
  { councilId: 'mornington-peninsula', nameContains: 'Mornington', lat: -38.219, lng: 145.039 },
  { councilId: 'mornington-peninsula', nameContains: 'Rosebud', lat: -38.354, lng: 144.895 },
  { councilId: 'mornington-peninsula', nameContains: 'Somerville', lat: -38.228, lng: 145.134 },
  // Nillumbik
  { councilId: 'nillumbik', nameContains: 'Diamond Valley', lat: -37.670, lng: 145.142 },
  { councilId: 'nillumbik', nameContains: 'Eltham', lat: -37.714, lng: 145.152 },
  // Port Phillip
  { councilId: 'port-phillip', nameContains: 'Albert Park', lat: -37.844, lng: 144.959 },
  { councilId: 'port-phillip', nameContains: 'Emerald Hill', lat: -37.834, lng: 144.961 },
  { councilId: 'port-phillip', nameContains: 'Middle Park', lat: -37.851, lng: 144.961 },
  { councilId: 'port-phillip', nameContains: 'Port Melbourne', lat: -37.838, lng: 144.928 },
  { councilId: 'port-phillip', nameContains: 'St Kilda', lat: -37.858, lng: 144.980 },
  // Stonnington
  { councilId: 'stonnington', nameContains: 'Malvern Library', lat: -37.857, lng: 145.026 },
  { councilId: 'stonnington', nameContains: 'Phoenix Park', lat: -37.849, lng: 145.003 },
  { councilId: 'stonnington', nameContains: 'Prahran', lat: -37.848, lng: 144.997 },
  { councilId: 'stonnington', nameContains: 'Toorak', lat: -37.842, lng: 145.011 },
  // Whitehorse
  { councilId: 'whitehorse', nameContains: 'Blackburn', lat: -37.821, lng: 145.157 },
  { councilId: 'whitehorse', nameContains: 'Box Hill', lat: -37.820, lng: 145.121 },
  { councilId: 'whitehorse', nameContains: 'Nunawading', lat: -37.821, lng: 145.176 },
  { councilId: 'whitehorse', nameContains: 'Vermont South', lat: -37.860, lng: 145.196 },
  // Whittlesea
  { councilId: 'whittlesea', nameContains: 'Lalor', lat: -37.667, lng: 145.020 },
  { councilId: 'whittlesea', nameContains: 'Mernda', lat: -37.618, lng: 145.021 },
  { councilId: 'whittlesea', nameContains: 'Mill Park', lat: -37.656, lng: 145.061 },
  { councilId: 'whittlesea', nameContains: 'Murnong', lat: -37.685, lng: 145.068 },
  { councilId: 'whittlesea', nameContains: 'Thomastown', lat: -37.686, lng: 145.030 },
  { councilId: 'whittlesea', nameContains: 'Whittlesea', lat: -37.510, lng: 145.120 },
  // Wyndham
  { councilId: 'wyndham', nameContains: 'Hoppers Crossing', lat: -37.882, lng: 144.700 },
  { councilId: 'wyndham', nameContains: 'Tarneit', lat: -37.840, lng: 144.676 },
  { councilId: 'wyndham', nameContains: 'Manor Lakes', lat: -37.867, lng: 144.654 },
  { councilId: 'wyndham', nameContains: 'Point Cook', lat: -37.908, lng: 144.740 },
  { councilId: 'wyndham', nameContains: 'Werribee', lat: -37.905, lng: 144.659 },
  // Yarra
  { councilId: 'yarra', nameContains: 'North Fitzroy', lat: -37.793, lng: 144.997 },
  { councilId: 'yarra', nameContains: 'Carlton', lat: -37.805, lng: 144.969 },
  { councilId: 'yarra', nameContains: 'Collingwood', lat: -37.800, lng: 145.006 },
  { councilId: 'yarra', nameContains: 'Fitzroy Library', lat: -37.798, lng: 144.981 },
  { councilId: 'yarra', nameContains: 'Richmond', lat: -37.826, lng: 145.004 },
  // Yarra Ranges
  { councilId: 'yarra-ranges', nameContains: 'Belgrave', lat: -37.904, lng: 145.353 },
  { councilId: 'yarra-ranges', nameContains: 'Healesville', lat: -37.655, lng: 145.512 },
  { councilId: 'yarra-ranges', nameContains: 'Lilydale', lat: -37.754, lng: 145.348 },
  { councilId: 'yarra-ranges', nameContains: 'Montrose', lat: -37.819, lng: 145.340 },
  { councilId: 'yarra-ranges', nameContains: 'Mooroolbark', lat: -37.779, lng: 145.312 },
  { councilId: 'yarra-ranges', nameContains: 'Yarra Junction', lat: -37.784, lng: 145.611 },
]

async function main() {
  let totalUpdated = 0

  for (const entry of coords) {
    const result = await prisma.library.updateMany({
      where: {
        councilId: entry.councilId,
        name: { contains: entry.nameContains, mode: 'insensitive' },
        lat: null,
      },
      data: {
        lat: entry.lat,
        lng: entry.lng,
      },
    })
    if (result.count > 0) {
      console.log(`Updated ${result.count} library(ies) for "${entry.nameContains}" in ${entry.councilId}`)
      totalUpdated += result.count
    } else {
      console.warn(`No match for "${entry.nameContains}" in ${entry.councilId}`)
    }
  }

  console.log(`\nTotal updated: ${totalUpdated}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
