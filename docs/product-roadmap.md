# Australia Council Explorer — 产品路线图

> 创建日期：2026-06-10
> 当前阶段：Melbourne MVP（Phase 1）

---

## 产品愿景

从 Melbourne Council Explorer 逐步扩展到全澳大利亚，最终覆盖 127 个 council，涵盖墨尔本、悉尼、布里斯班、阿德莱德、珀斯、日朗、巴拉瑞特、本迪戈等主要城市，以及北领地达尔文。

**最终产品名：Australia Council Explorer**

---

## Phase 1 ✅ Melbourne MVP（已完成）

**31个 council，完整功能栈**

| 层 | 状态 |
|---|---|
| 数据库 schema（5个 Prisma 模型） | ✅ |
| 静态数据（31 councils seeded） | ✅ |
| ABS 人口数据脚本 | ✅ |
| 爬虫（mylibrary.digital / Humanitix / Eventbrite） | ✅ |
| GitHub Actions 每日自动抓取 | ✅ |
| API routes（/api/councils / /api/events） | ✅ |
| 首页地图（Mapbox） | ✅ |
| Council 列表页（区域筛选 + 搜索） | ✅ |
| Council 详情页（3 tabs） | ✅ |
| Events 日历页（筛选 + 分页） | ✅ |
| Compare 页（最多3个 council） | ✅ |

**部署前待办：**
1. 配置 `.env.local`（Neon `DATABASE_URL` + `NEXT_PUBLIC_MAPBOX_TOKEN`）
2. `npx prisma migrate dev --name init`
3. `npx tsx scripts/seed-councils.ts`
4. 下载 ABS CSV → `npx tsx scripts/import-abs.ts`
5. 下载 Melbourne LGA GeoJSON（见 `public/GEOJSON_README.md`）
6. Push 到 GitHub，Vercel 部署，配置 Secrets

---

## Phase 2 — 人口统计扩展 + 收藏功能

### 2a — 丰富 Council 详情页人口数据

**Council 详情页 Overview tab 新增以下数据（来源：ABS Census）**

#### 年龄段分布（ABS G16）

| 年龄段 | 意义 |
|---|---|
| 0–4 岁 | 幼儿园年龄，关注 Storytime / 幼儿活动的家庭 |
| 5–11 岁 | 小学年龄 |
| 12–17 岁 | 中学年龄 |
| 18–64 岁 | 劳动年龄人口 |
| 65 岁以上 | 老龄化程度 |

展示方式：横向进度条，可与其他 council 对比。

#### 文化多样性（ABS G01 / G08）

- 海外出生人口占比
- 家庭主要语言（英语 / 普通话 / 越南语 / 印地语 / 其他）

#### 社会经济（ABS G17 / G25）

- 家庭周收入中位数
- 租房 vs 自住比例
- 平均每户人数

**需要做的工作：**
- 下载 ABS G16 表（年龄段），和 G01 下载方式相同
- 扩展 `CouncilStats` model，加 age group 字段
- 更新 `scripts/import-abs.ts` 处理 G16
- 更新 council 详情页 Overview tab UI

### 2b — Childcare / School 设施页（Phase 3+ 再做）

Council 详情页 Facilities tab 未来展示真实的设施列表：

| 设施类型 | 数据来源 | 说明 |
|---|---|---|
| 幼儿园 / Childcare | ACECQA 国家注册库（公开 CSV） | 含地址、评级、电话 |
| 小学 | ACARA My School（API） | 含学校类型、ICSEA 分数 |
| 中学 | ACARA My School（API） | 同上 |
| 维州学校坐标 | data.vic.gov.au | 现成 dataset，直接下载 |

**展示形式：** 小地图 + 列表，按距离或字母排序。

**现在不做的原因：** 需要新数据源接入，和当前 MVP 部署解耦，放 Phase 3 单独处理。

---

## Phase 2 — 收藏功能（council-ask-feature-codex.md）

**功能：用户收藏自己关注的 council / library，只看相关活动**

### MVP 版（无需登录，localStorage）

| 功能 | 说明 |
|---|---|
| 收藏 council | 每个 council card 加星标 ☆/★，保存到 localStorage |
| 收藏 library | 每个 library card 加星标 |
| `/my-events` 页面 | 只显示收藏范围内的未来活动，按日期分组，分页加载 |
| Booking 标签 | 每条活动显示来源：`Book on Eventbrite` / `Humanitix` / `No booking required` |
| 数据来源标签 | 显示 `Official` / `Eventbrite` / `mylibrary.digital` 等 |
| `Updated X hours ago` | 显示数据抓取时间 |
| 空状态引导 | 收藏为空时引导用户去 `/councils` 选择 |

### 扩展版（有需求时再做）

| 功能 | 时机 |
|---|---|
| 用户登录 + 跨设备同步 | Phase 2 后期 |
| 收藏 category | 同上 |
| 保存 view preset（My councils / My libraries） | 同上 |
| 邮件提醒新活动 | Phase 3 |
| Weekly digest | Phase 3 |

### 多语言支持（council-ask-feature-codex.md 要求）

建议顺序：简体中文 → 英文 → 越南语 → 印地语

- 使用 `next-intl`
- UI 文案统一放 locale 文件，不写死在组件里
- 优先国际化：导航 / 筛选器 / 空状态 / 按钮 / booking 标签
- 内容翻译（event 标题/描述）是第二阶段

### 数据模型

```prisma
// 本地存储版不需要数据库表
// 如果以后加登录：

model FavoriteCouncil {
  id        String   @id @default(cuid())
  userId    String
  councilId String
  createdAt DateTime @default(now())
  @@unique([userId, councilId])
}

model FavoriteLibrary {
  id        String   @id @default(cuid())
  userId    String
  libraryId String
  createdAt DateTime @default(now())
  @@unique([userId, libraryId])
}
```

### 新增 API

- `GET /api/events?favoritesOnly=true&cursor=...&limit=20`
- `GET /api/my-events`（聚合接口，内部处理收藏过滤）

---

## Phase 3 — Ballarat + Bendigo（快速胜利）

**2个 council，全靠现有爬虫，预计 1 天完成**

| Council | 平台 | 工作 |
|---|---|---|
| Ballarat | Humanitix（`ballaratlibraries`） | 加入 Humanitix 配置 |
| Bendigo（Greater Bendigo） | Eventbrite（organizer `12180122178`） | 加入 Eventbrite 配置 |

数据库加 `city` 字段：
```sql
ALTER TABLE "Council" ADD COLUMN city TEXT NOT NULL DEFAULT 'melbourne';
```

---

## Phase 4 — Brisbane（10个 council，1-2周）

| 平台 | Council | 工作量 |
|---|---|---|
| mylibrary.digital | Moreton Bay, Logan, Scenic Rim | 加入配置（各5分钟） |
| Eventbrite | Redland City | 加入配置 |
| 自定义爬虫 | Brisbane BCC（SirsiDynix）, Ipswich, Gold Coast, Sunshine Coast, Lockyer Valley, Somerset | 优先 BCC（澳洲最大 council） |

---

## Phase 5 — Adelaide（19个 council，1-2周）

| 平台 | Council | 工作量 |
|---|---|---|
| Humanitix | Adelaide City, Campbelltown SA, NP&StP, Port Adelaide Enfield | 加入配置 |
| Eventbrite | Marion, Mitcham, Onkaparinga, Salisbury, Tea Tree Gully, Walkerville | 加入配置 |
| 自定义爬虫 | Charles Sturt, Holdfast Bay, Mount Barker, Playford, Prospect, Unley, Victor Harbor, West Torrens | 优先 Charles Sturt / Onkaparinga |

---

## Phase 6 — Sydney（33个 council，3-4周）

最复杂，自定义网站最多（13个）。

| 平台 | Council | 工作量 |
|---|---|---|
| mylibrary.digital | Fairfield | 加入配置 |
| Humanitix | Liverpool, Northern Beaches, Penrith, Randwick | 加入配置 |
| Eventbrite | Blacktown, Blue Mountains, Campbelltown, Canada Bay, Canterbury-Bankstown, Georges River, Hawkesbury, Hills Shire, Inner West, Parramatta, Sutherland, Sydney CoS + 2个 | 找各自 organizer_id，加入配置 |
| 自定义爬虫 | Ku-ring-gai, Waverley, Willoughby, Ryde, Strathfield, Mosman, Wollondilly 等 13个 | 优先人口大的 5 个 |

---

## Phase 7 — Perth（30个 council，3-4周）

| 平台 | Council | 工作量 |
|---|---|---|
| mylibrary.digital | Cockburn, Vincent | 加入配置 |
| Humanitix | Armadale, Fremantle, Serpentine-Jarrahdale, South Perth, Stirling, Swan | 加入配置 |
| Eventbrite | Canning, Gosnells, Kwinana, Melville, Rockingham | 加入配置 |
| 自定义爬虫 | Joondalup, Bayswater, Cambridge, Wanneroo, Nedlands 等 15个 | 优先 Stirling / Wanneroo / Joondalup |

---

## Phase 8 — Geelong + 北领地达尔文（可选）

| Council | 平台 | 说明 |
|---|---|---|
| Greater Geelong | Communico（`events.grlc.vic.gov.au`） | 新平台，先查是否有 `/api/events` JSON 端点，如有可复用 |
| Darwin（NT） | 待调研 | 北领地只有 Darwin City Council，图书馆规模小，待查平台 |

---

## 爬虫工作量总览

### 无需新写爬虫（加配置即可）

| 平台 | 新增 council 数 |
|---|---|
| mylibrary.digital | 6 个（Fairfield + Moreton Bay + Logan + Scenic Rim + Cockburn + Vincent） |
| Humanitix API | 16 个 |
| Eventbrite API | 27 个 |
| **合计** | **49 个，只加配置** |

### 需要新写爬虫

| 城市 | 自定义网站数 | 优先度 |
|---|---|---|
| Sydney | 13 | 中（先做5个人口大的） |
| Brisbane | 6（含 BCC） | 高（BCC 是澳洲最大） |
| Adelaide | 8 | 低 |
| Perth | 15 | 低 |
| Geelong | 1（Communico 新平台） | 中（可复用） |

---

## URL 结构规划

全国唯一 slug 方案（推荐）：
```
/councils/monash-vic
/councils/blacktown-nsw
/councils/brisbane-city-qld
/councils/adelaide-city-sa
```

或按城市分层：
```
/cities/melbourne/councils/monash
/cities/sydney/councils/blacktown
```

---

## 里程碑时间线

| Phase | 内容 | 预计时间 |
|---|---|---|
| Phase 1 ✅ | Melbourne 31个 council，MVP 完整功能 | 完成 |
| Phase 2 | 收藏功能 + 多语言 | 部署后 1-2周 |
| Phase 3 | Ballarat + Bendigo | 1天 |
| Phase 4 | Brisbane 10个 | 1-2周 |
| Phase 5 | Adelaide 19个 | 1-2周 |
| Phase 6 | Sydney 33个 | 3-4周 |
| Phase 7 | Perth 30个 | 3-4周 |
| Phase 8 | Geelong + Darwin | 1周 |
| **完成** | **全澳 127个 council，改名 Australia Council Explorer** | — |

---

*此文件整合自 `docs/city-council-扩展.md` 和 `docs/council-ask-feature-codex.md`，由 Claude Code 生成于 2026-06-10。*
