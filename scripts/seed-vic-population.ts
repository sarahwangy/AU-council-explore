// Seed population and area for VIC councils (ABS ERP 2021 / ABS LGA data)
import { prisma } from '../lib/prisma'

const VIC_POP: Record<string, { population: number; areaSqKm: number }> = {
  'melbourne':           { population: 179673,  areaSqKm: 37.7   },
  'port-phillip':        { population: 116191,  areaSqKm: 20.7   },
  'stonnington':         { population: 109757,  areaSqKm: 25.8   },
  'yarra':               { population: 101143,  areaSqKm: 19.5   },
  'boroondara':          { population: 176840,  areaSqKm: 60.0   },
  'manningham':          { population: 128534,  areaSqKm: 114.0  },
  'whitehorse':          { population: 177681,  areaSqKm: 63.9   },
  'maroondah':           { population: 117077,  areaSqKm: 61.2   },
  'knox':                { population: 164282,  areaSqKm: 113.9  },
  'yarra-ranges':        { population: 162498,  areaSqKm: 2466.8 },
  'monash':              { population: 202110,  areaSqKm: 81.3   },
  'glen-eira':           { population: 155631,  areaSqKm: 38.5   },
  'bayside':             { population: 104000,  areaSqKm: 36.8   },
  'kingston':            { population: 164271,  areaSqKm: 91.0   },
  'frankston':           { population: 139521,  areaSqKm: 131.4  },
  'mornington-peninsula': { population: 167436, areaSqKm: 724.4  },
  'banyule':             { population: 131774,  areaSqKm: 63.3   },
  'nillumbik':           { population: 65879,   areaSqKm: 433.5  },
  'whittlesea':          { population: 240026,  areaSqKm: 490.3  },
  'darebin':             { population: 163012,  areaSqKm: 52.8   },
  'merri-bek':           { population: 147083,  areaSqKm: 50.1   },
  'hume':                { population: 224271,  areaSqKm: 504.0  },
  'brimbank':            { population: 205000,  areaSqKm: 123.0  },
  'hobsons-bay':         { population: 96799,   areaSqKm: 65.7   },
  'maribyrnong':         { population: 90000,   areaSqKm: 31.1   },
  'melton':              { population: 200000,  areaSqKm: 527.7  },
  'moonee-valley':       { population: 127000,  areaSqKm: 43.4   },
  'wyndham':             { population: 302000,  areaSqKm: 542.0  },
  'casey':               { population: 388000,  areaSqKm: 410.8  },
  'cardinia':            { population: 128000,  areaSqKm: 1283.9 },
  'greater-dandenong':   { population: 168000,  areaSqKm: 129.4  },
  // Regional VIC
  'geelong':             { population: 281000,  areaSqKm: 1247.0 },
  'ballarat':            { population: 116000,  areaSqKm: 738.0  },
  'bendigo':             { population: 121000,  areaSqKm: 3000.0 },
  'latrobe':             { population: 75000,   areaSqKm: 4070.0 },
  'greater-shepparton':  { population: 67000,   areaSqKm: 2421.0 },
  'wodonga':             { population: 44000,   areaSqKm: 435.0  },
  'mildura':             { population: 58000,   areaSqKm: 22330.0},
  'warrnambool':         { population: 35000,   areaSqKm: 119.0  },
}

async function main() {
  let updated = 0
  for (const [id, data] of Object.entries(VIC_POP)) {
    const result = await prisma.council.updateMany({
      where: { id, state: 'VIC' },
      data,
    })
    if (result.count > 0) updated++
    else console.warn(`  skipped (not found): ${id}`)
  }
  console.log(`Updated population/area for ${updated} VIC councils.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
