# 澳大利亚其他城市 Council 扩展计划

> 创建日期：2026-06-09
> 用途：Melbourne Council Explorer MVP 完成后的扩展规划
> 前置条件：先完成 Melbourne MVP（council-ticket.md T00–T15）

---

## 扩展总览

| 城市 | Council 数 | mylibrary.digital | Humanitix | Eventbrite | 自定义网站 | 扩展难度 |
|---|---|---|---|---|---|---|
| Melbourne | 31 | 10 | 8 | 8 | 5 | ✅ 已完成（MVP） |
| Sydney | 33 | 1 | 5 | 14 | 13 | ⭐⭐⭐ 高（自定义多） |
| Brisbane | 10 | 3 | 0 | 1 | 6 | ⭐⭐ 中 |
| Adelaide | 19 | 0 | 5 | 6 | 8 | ⭐⭐ 中 |
| Perth | 30 | 2 | 8 | 5 | 15 | ⭐⭐⭐ 高（自定义多） |
| Geelong | 1 | 0 | 0 | 0 | 1（Communico） | ⭐⭐ 中（新平台） |
| Ballarat | 1 | 0 | 1 | 0 | 0 | ⭐ 低 |
| Bendigo | 1 | 0 | 0 | 1 | 0 | ⭐ 低 |

**跨城市 mylibrary.digital 已确认子域名（一套爬虫全覆盖）：**
- VIC: `monlib` / `humelibraries` / `bayside` / `stonnington` / `events.yourlibrary.vic.gov.au`（Knox/Maroondah/Yarra Ranges）/ `libraryevents.kingston.vic.gov.au` / `libraryevents.melton.vic.gov.au` / `libraryevents.mvcc.vic.gov.au`
- NSW: `fairfieldcity`
- QLD: `loganlibraries` / `moretonbay` / `scenicrim`
- WA: `cockburnlibraries` / `vincent`

**合计 14 个 council 跨4个州，一套 mylibrary.digital 爬虫全搞定。**

---

## 建议扩展顺序

```
Phase 1 (MVP): Melbourne ✅
Phase 2 (快速胜利): Ballarat → Bendigo（各1个council，1天内搞定）
Phase 3 (中等): Brisbane → Adelaide（平台较统一）
Phase 4 (挑战): Sydney → Perth（自定义网站多，工作量大）
```

---

## 一、Sydney（大悉尼地区，33个 Council）

### 平台分布

| 平台 | 数量 | 代表 Council |
|---|---|---|
| Eventbrite | 14 | Blacktown, City of Sydney, Campbelltown, Canterbury-Bankstown, Hills Shire 等 |
| 自定义网站 | 13 | Ku-ring-gai, Waverley, Willoughby, Ryde, Woollahra 等 |
| Humanitix | 5 | Liverpool, Northern Beaches, Penrith, Randwick |
| mylibrary.digital | 1 | Fairfield |

### 完整列表

| Council | 图书馆系统 | Events URL | 平台 |
|---|---|---|---|
| Bayside NSW | Bayside Council Libraries | bayside.nsw.gov.au/recreation/places/libraries | 自定义（部分 Eventbrite） |
| Blacktown | Blacktown City Libraries | eventbrite.com.au/o/blacktown-city-libraries-3248519566 | Eventbrite |
| Blue Mountains | Blue Mountains City Library | eventbrite.com.au/o/blue-mountains-library-7053486185 | Eventbrite |
| Burwood | Burwood Library | burwood.nsw.gov.au/For-Residents/Burwood-Library | 自定义 |
| Camden | Camden Libraries | library.camden.nsw.gov.au/events/ | 自定义 |
| Campbelltown NSW | Campbelltown City Library | eventbrite.com.au/o/campbelltown-city-library-17807591635 | Eventbrite |
| Canada Bay | City of Canada Bay Libraries | eventbrite.com.au/o/city-of-canada-bay-libraries-8858155053 | Eventbrite |
| Canterbury-Bankstown | Canterbury Bankstown Library | eventbrite.com/o/canterbury-bankstown-library-1419778363 | Eventbrite |
| Cumberland | Cumberland City Libraries | cumberland.nsw.gov.au/library | 自定义 |
| Fairfield | Fairfield City Open Libraries | fairfieldcity.events.mylibrary.digital | **mylibrary.digital** |
| Georges River | Georges River Libraries | eventbrite.com/d/australia/georges-river-library | Eventbrite |
| Hawkesbury | Hawkesbury Library Service | eventbrite.com.au/o/hawkesbury-library-service-11842492197 | Eventbrite |
| Hills Shire | The Hills Shire Library Service | eventbrite.com.au/o/the-hills-shire-library-service-231647259 | Eventbrite |
| Hornsby | Hornsby Shire Library | hornsby.nsw.gov.au/library/using-the-library/events | 自定义（部分 Humanitix） |
| Hunters Hill | Hunters Hill Council Library | huntershill.nsw.gov.au/Community/Services/Library | 自定义 |
| Inner West | Inner West Libraries | eventbrite.com/d/australia--sydney/inner-west-libraries | Eventbrite |
| Ku-ring-gai | Ku-ring-gai Library | krg.nsw.gov.au/Community/Ku-ring-gai-Library/Library-events | 自定义 |
| Lane Cove | Shorelink（Lane Cove） | northsydney.nsw.gov.au/library | 自定义 |
| Liverpool | Liverpool City Library | events.humanitix.com/host/liverpoolcitylibrary | **Humanitix** |
| Mosman | Shorelink（Mosman） | events.mosman.nsw.gov.au/genres/library | 自定义 Drupal |
| North Sydney | Shorelink（Stanton Library） | northsydney.nsw.gov.au/library | 自定义 |
| Northern Beaches | Northern Beaches Library Service | events.humanitix.com/host/627aef058394a30b8f247b4d | **Humanitix** |
| Parramatta | City of Parramatta Libraries | eventbrite.com.au/d/australia--sydney/parramatta-library | Eventbrite |
| Penrith | Penrith City Libraries | events.humanitix.com/host/penrith-city-library | **Humanitix** |
| Randwick | Randwick City Library | events.humanitix.com/host/6114b6d7532ffb0e7865d6df | **Humanitix** |
| Ryde | Ryde Library | ryde.nsw.gov.au/Events/Listing | 自定义 |
| Strathfield | Strathfield Library | strathfield.nsw.gov.au/Play/Events-Calendar | 自定义 |
| Sutherland | Sutherland Shire Libraries | eventbrite.com.au/o/sutherland-shire-libraries-7667220461 | Eventbrite |
| Sydney CoS | City of Sydney Library | eventbrite.com.au/o/city-of-sydney-library-34879367363 | Eventbrite |
| Waverley | Waverley Library | waverley.nsw.gov.au/library/programs_and_events | 自定义 |
| Willoughby | Willoughby City Libraries | willoughby.nsw.gov.au（图书馆页面） | 自定义 |
| Wollondilly | Wollondilly Library | library.wollondilly.nsw.gov.au/events/ | 自定义 |
| Woollahra | Woollahra Libraries | woollahra.nsw.gov.au/Library/Whats-on | 自定义 |

### 爬虫方案

```
现有爬虫复用：
- mylibrary.digital 爬虫 → Fairfield（1个，直接加入配置）
- Humanitix API → Liverpool, Northern Beaches, Penrith, Randwick（4个，加入配置）
- Eventbrite API → 14个 council（加入配置，需要找各自 organizer_id）

新增工作：
- 13个自定义网站 → 各自写爬虫，优先覆盖人口大的 council
  优先级：Inner West > Ku-ring-gai > Waverley > Willoughby > Ryde
```

---

## 二、Brisbane 地区（10个 Council）

### 平台分布

| 平台 | 数量 | 代表 Council |
|---|---|---|
| 自定义网站 | 6 | Brisbane BCC, Ipswich, Gold Coast, Sunshine Coast, Lockyer Valley, Somerset |
| mylibrary.digital | 3 | Moreton Bay, Logan, Scenic Rim |
| Eventbrite | 1 | Redland City |

### 完整列表

| Council | 图书馆系统 | Events URL | 平台 |
|---|---|---|---|
| Brisbane City Council | Brisbane City Libraries | brisbane.qld.gov.au/libraries-venues-and-facilities/libraries/library-events-and-programs | 自定义（SirsiDynix） |
| Moreton Bay | Moreton Bay Libraries | moretonbay.events.mylibrary.digital | **mylibrary.digital** |
| Redland City | Redland City Council Libraries | eventbrite.com.au/cc/library-events-for-adults-2547249 | Eventbrite |
| Logan City | Logan Libraries | loganlibraries.events.mylibrary.digital | **mylibrary.digital** |
| Ipswich City | Ipswich Libraries | ipswich.qld.gov.au/Explore/Ipswich-Libraries | 自定义（部分 Eventbrite） |
| Gold Coast City | Gold Coast Libraries | goldcoast.qld.gov.au/libraries/Whats-on | 自定义（Granicus） |
| Sunshine Coast | Sunshine Coast Libraries | library.sunshinecoast.qld.gov.au/Whats-on/Events-Calendar | 自定义 |
| Scenic Rim | Scenic Rim Libraries | scenicrim.events.mylibrary.digital | **mylibrary.digital** |
| Lockyer Valley | Lockyer Valley Libraries | lockyervalley.qld.gov.au/our-region/facilities/libraries | 自定义（Spydus） |
| Somerset | Somerset Libraries | （与 Lockyer Valley 共享服务范围） | 自定义 |

### 爬虫方案

```
现有爬虫复用：
- mylibrary.digital 爬虫 → Moreton Bay, Logan, Scenic Rim（3个，加入配置）
- Eventbrite API → Redland（1个，找 organizer_id）

新增工作：
- 6个自定义网站 → 优先 Brisbane BCC（最大，影响力最大）
  Brisbane BCC 用 SirsiDynix，需研究其 API 或 HTML 结构
```

---

## 三、Adelaide（大阿德莱德，19个 Council）

### 平台分布

| 平台 | 数量 | 代表 Council |
|---|---|---|
| 自定义网站 | 8 | Charles Sturt, Holdfast Bay, Mount Barker, Playford 等 |
| Eventbrite | 6 | Marion, Mitcham, Onkaparinga, Salisbury, Tea Tree Gully, Walkerville |
| Humanitix | 5 | Adelaide City, Campbelltown SA, Norwood Payneham & St Peters, Port Adelaide Enfield |

**注：** SA 有州级图书馆汇总页 `libraries.sa.gov.au/whatson`，但各 council 独立选择平台。

### 完整列表

| Council | 图书馆系统 | Events URL | 平台 |
|---|---|---|---|
| Adelaide CoA | Adelaide City Libraries | events.humanitix.com/host/adelaide-city-libraries | **Humanitix** |
| Burnside | Burnside Library | burnside.sa.gov.au/Community-Recreation/Burnside-Library/Whats-on | 自定义（部分 Eventbrite） |
| Campbelltown SA | Campbelltown Public Library | events.humanitix.com/host/campbelltown-library-sa | **Humanitix** |
| Charles Sturt | Charles Sturt Libraries | charlessturt.sa.gov.au/community/library | 自定义 |
| Holdfast Bay | Holdfast Bay Library Service | holdfast.sa.gov.au/libraries | 自定义 |
| Marion | Marion Library Service | eventbrite.com.au/d/australia--adelaide/library-events | Eventbrite |
| Mitcham | Mitcham Libraries | eventbrite.com.au/d/australia--mitcham/mitcham-library | Eventbrite |
| Mount Barker | Mount Barker Community Library | mountbarker.sa.gov.au/community/libraries | 自定义 |
| Norwood Payneham & St Peters | NP&StP Library Service | events.humanitix.com/host/norwood-payneham-and-st-peters-libraries | **Humanitix** |
| Onkaparinga | Onkaparinga Libraries | eventbrite.com/o/onkaparinga-libraries-13918294808 | Eventbrite |
| Playford | Playford City Library Service | playford.sa.gov.au/community/library-services | 自定义 |
| Port Adelaide Enfield | PAE Libraries | events.humanitix.com/host/paelibraries | **Humanitix** |
| Prospect | Prospect Public Library | prospect.sa.gov.au/community/library | 自定义 |
| Salisbury | Salisbury Library Service | eventbrite.com.au/d/australia--adelaide/library-events | Eventbrite |
| Tea Tree Gully | Tea Tree Gully Library | eventbrite.com/d/australia--tea-tree-gully/teatree-library | Eventbrite |
| Unley | Unley Libraries | unley.sa.gov.au/Events-facilities/Facilities-venues/Unley-Libraries | 自定义 |
| Victor Harbor | Victor Harbor Library | victorharbor.sa.gov.au（图书馆页面） | 自定义 |
| Walkerville | Walkerville Library | eventbrite.com.au/d/australia--adelaide/walkerville-library | Eventbrite |
| West Torrens | West Torrens Library | westtorrens.sa.gov.au/West-Torrens-Library | 自定义 |

### 爬虫方案

```
现有爬虫复用：
- Humanitix API → Adelaide City, Campbelltown SA, NP&StP, Port Adelaide Enfield（4个，加入配置）
- Eventbrite API → Marion, Mitcham, Onkaparinga, Salisbury, Tea Tree Gully, Walkerville（6个）

新增工作：
- 8个自定义网站 → 优先人口大的 council（Charles Sturt, Onkaparinga）
```

---

## 四、Perth（大珀斯，30个 Council）

### 平台分布

| 平台 | 数量 | 代表 Council |
|---|---|---|
| 自定义网站 | 15 | Joondalup, Bayswater, Cambridge, Joondalup, Wanneroo 等 |
| Humanitix | 8 | Armadale, Fremantle, Serpentine-Jarrahdale, South Perth, Stirling, Swan 等 |
| Eventbrite | 5 | Canning, Gosnells, Kwinana, Melville, Rockingham |
| mylibrary.digital | 2 | Cockburn, Vincent |

**注：** 西郊图书馆网络（The Grove Library）— Peppermint Grove / Cottesloe / Mosman Park 共用一个图书馆服务。

### 完整列表

| Council | 图书馆系统 | Events URL | 平台 |
|---|---|---|---|
| Armadale | City of Armadale Libraries | events.humanitix.com/host/city-of-armadale-library-services | **Humanitix** |
| Bassendean | Bassendean Memorial Library | library.bassendean.wa.gov.au/events/ | 自定义（ASP.NET） |
| Bayswater | City of Bayswater Libraries | bayswater.wa.gov.au/arts-and-leisure/libraries | 自定义 |
| Belmont | Ruth Faulkner Library | belmont.wa.gov.au（图书馆页面） | 自定义 |
| Cambridge | Town of Cambridge Library | library.cambridge.wa.gov.au/Events | 自定义 |
| Canning | City of Canning Libraries | canning.wa.gov.au/recreation-and-community/libraries/library-events | Eventbrite |
| Claremont | Claremont Library | claremont.wa.gov.au（图书馆页面） | 自定义 |
| Cockburn | Cockburn Libraries | cockburnlibraries.events.mylibrary.digital | **mylibrary.digital** |
| Cottesloe | The Grove Library（西郊网络） | thegrovelibrary.net | 自定义 |
| Fremantle | City of Fremantle Library | events.humanitix.com/host/freolibrary | **Humanitix** |
| Gosnells | City of Gosnells Libraries | eventbrite.com/o/city-of-gosnells-library-services-14227190044 | Eventbrite |
| Joondalup | City of Joondalup Libraries | joondalup.wa.gov.au/community-and-spaces/libraries | 自定义（Spydus） |
| Kalamunda | City of Kalamunda Libraries | kalamunda.wa.gov.au/community/libraries/events | 自定义 |
| Kwinana | Darius Wells Library | kwinana.wa.gov.au/city-life/things-to-do/events | Eventbrite |
| Melville | City of Melville Libraries | eventbrite.com.au/d/australia--melville/melville-library | Eventbrite |
| Mosman Park | The Grove Library（西郊网络） | thegrovelibrary.net | 自定义 |
| Mundaring | Shire of Mundaring Libraries | mundaring.wa.gov.au/events | 自定义 |
| Murray | Shire of Murray Libraries | murray.wa.gov.au（图书馆页面） | 自定义 |
| Nedlands | City of Nedlands Library | nedlands.wa.gov.au/community/libraries | 自定义 |
| Peppermint Grove | The Grove Library（西郊网络） | thegrovelibrary.net | 自定义 |
| Perth CoP | City of Perth Library | perth.wa.gov.au/community/community-services-and-facilities/city-of-perth-library | 自定义（部分 Eventbrite） |
| Rockingham | City of Rockingham Libraries | eventbrite.com.au/d/australia--north-perth/rockingham-library | Eventbrite |
| Serpentine-Jarrahdale | SJ Library Services | events.humanitix.com/host/serpentine-jarrahdale-library-services | **Humanitix** |
| South Perth | City of South Perth Libraries | events.humanitix.com/host/city-of-south-perth-libraries | **Humanitix** |
| Stirling | Stirling Libraries | events.humanitix.com/host/stirling-libraries | **Humanitix** |
| Subiaco | City of Subiaco Library | subiaco.wa.gov.au/library | 自定义（西郊网络） |
| Swan | City of Swan Libraries | events.humanitix.com/host/swan-libraries | **Humanitix** |
| Victoria Park | Victoria Park Library | victoriaparklibrary.wa.gov.au/events/ | 自定义（ASP.NET） |
| Vincent | City of Vincent Library | vincent.events.mylibrary.digital | **mylibrary.digital** |
| Wanneroo | City of Wanneroo Libraries | wanneroo.wa.gov.au/site/scripts/events_info.php | 自定义 |

### 爬虫方案

```
现有爬虫复用：
- mylibrary.digital 爬虫 → Cockburn, Vincent（2个，加入配置）
- Humanitix API → Armadale, Fremantle, Serpentine-Jarrahdale, South Perth, Stirling, Swan（6个）
- Eventbrite API → Canning, Gosnells, Kwinana, Melville, Rockingham（5个）

新增工作：
- 15个自定义网站 → 工作量最大，优先人口大的
  优先级：Stirling > Wanneroo > Joondalup > Swan > Bayswater
```

---

## 五、Geelong（1个 Council）

| Council | 图书馆系统 | Events URL | 平台 |
|---|---|---|---|
| City of Greater Geelong | Geelong Regional Libraries (GRLC) | events.grlc.vic.gov.au | **Communico**（新平台，需研究） |

### 爬虫方案

```
新增工作：
- Communico 平台（library-specific SaaS）
- 先查 events.grlc.vic.gov.au 是否有 JSON API（多数 Communico 实例有 /api/events 端点）
- 如有 API → 写通用 Communico 爬虫（未来可复用给其他 Communico 图书馆）
- 如无 → Cheerio 解析 HTML
```

---

## 六、Ballarat（1个 Council）

| Council | 图书馆系统 | Events URL | 平台 |
|---|---|---|---|
| City of Ballarat | Ballarat Libraries | events.humanitix.com/host/ballaratlibraries | **Humanitix** |

### 爬虫方案

```
现有爬虫复用：
- Humanitix API → 加入配置，1行代码搞定
预计工作量：30分钟
```

---

## 七、Bendigo（1个 Council）

| Council | 图书馆系统 | Events URL | 平台 |
|---|---|---|---|
| City of Greater Bendigo | Goldfields Library Corporation | eventbrite.com.au/o/bendigo-library-12180122178 | **Eventbrite** |

### 爬虫方案

```
现有爬虫复用：
- Eventbrite API → 找到 organizer_id（12180122178），加入配置
预计工作量：30分钟
```

---

## 爬虫工作量汇总

### 可直接复用现有爬虫的 council（加配置即可）

| 平台 | 新增 Council 数 | 工作量 |
|---|---|---|
| mylibrary.digital | Fairfield(NSW) + Moreton Bay + Logan + Scenic Rim + Cockburn + Vincent = 6个 | 每个5分钟，加入配置列表 |
| Humanitix API | Sydney 5个 + Adelaide 4个 + Perth 6个 + Ballarat 1个 = 16个 | 找 host ID，加入配置 |
| Eventbrite API | Sydney 14个 + Brisbane 1个 + Adelaide 6个 + Perth 5个 + Bendigo 1个 = 27个 | 找 organizer_id，加入配置 |

**合计：49个 council 无需新写爬虫，只需加配置。**

### 需要新写爬虫的

| 城市 | 自定义网站数 | 优先级 |
|---|---|---|
| Sydney | 13 | 中（先做人口大的5个） |
| Brisbane | 6（含 Brisbane BCC） | 高（BCC 是澳洲最大 council） |
| Adelaide | 8 | 低 |
| Perth | 15 | 低 |
| Geelong | 1（Communico） | 中（新平台，可复用） |

---

## 数据库扩展方案

Melbourne MVP 完成后，只需要在 Council 表加一个 `city` 字段：

```sql
ALTER TABLE "Council" ADD COLUMN city TEXT NOT NULL DEFAULT 'melbourne';
```

URL 结构变成：
```
/cities/melbourne/councils/monash
/cities/sydney/councils/blacktown
/cities/brisbane/councils/brisbane-city
```

或者用扁平化 slug（council slug 全国唯一）：
```
/councils/monash-vic
/councils/blacktown-nsw
```

---

## 里程碑

| 阶段 | 内容 | 预计时间（从 Melbourne MVP 后） |
|---|---|---|
| Phase 2 | 加 Ballarat + Bendigo（2个，全靠现有爬虫） | 1天 |
| Phase 3 | 加 Brisbane region（10个） | 1-2周 |
| Phase 4 | 加 Adelaide（19个） | 1-2周 |
| Phase 5 | 加 Sydney（33个，自定义多） | 3-4周 |
| Phase 6 | 加 Perth（30个，自定义多） | 3-4周 |
| Phase 7 | 加 Geelong（1个，Communico） | 2-3天 |
| **完成** | 全澳 127个 council，改名 Australia Council Explorer | — |
