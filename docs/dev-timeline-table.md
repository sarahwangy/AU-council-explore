# Australia Council Explorer — 开发时间轴总表

## 完整时间线表格

| 日期 | 阶段 | 解决的事件 / 功能 | 用到的技术 |
|------|------|-------------------|------------|
| 2026-06-10 | 项目初始化 | 搭建项目脚手架、Council 列表/详情页、Events 日历页、Compare 对比页 | Next.js 16 App Router, Prisma 5, Neon PostgreSQL, Tailwind CSS |
| 2026-06-10 | 地图首页 | Mapbox 交互地图、VIC 区域着色、点击 council 跳转 | Mapbox GL JS, GeoJSON, React useCallback |
| 2026-06-10 | 数据爬取 | 自动爬取活动（mylibrary.digital / Humanitix / Eventbrite）、GitHub Actions 定时任务 | Python urllib, GitHub Actions cron, Prisma upsert |
| 2026-06-10 | 人口数据 | 导入 ABS G01 人口统计数据、修复 LGA 代码格式不匹配 | ABS open data, CSV parsing, Prisma seed |
| 2026-06-12 | 维州扩展 | 图书馆附近搜索、开/关状态显示、收藏功能 | Mapbox Geocoding API, Haversine 距离, localStorage |
| 2026-06-12 | 学校学区 | VIC 学区地图、地址自动补全、点在多边形内判断 | GeoJSON point-in-polygon, Mapbox Geocoding |
| 2026-06-12 | AI 搜索 | Claude Haiku 驱动的智能搜索页、Markdown 渲染、结果缓存 | Anthropic API, Claude Haiku, React Markdown |
| 2026-06-12 | 邮件功能 | 用户订阅/退订 council 更新邮件 | Resend API, Next.js API Route |
| 2026-06-13 | 全国扩展 | 8 个州地图切换、NSW/QLD/SA/WA/TAS/NT/ACT councils | Mapbox fitBounds, 多 GeoJSON 文件管理, Prisma 多州查询 |
| 2026-06-13 | 学校全国化 | NSW/QLD 学校数据导入、多州学区地图 | OSM Overpass API, Python urllib, Prisma upsert |
| 2026-06-13 | States 页面 | 各州综合信息页（人口/面积/城市/特色）| Next.js 静态渲染, Tailwind grid |
| 2026-06-13 | My Events 清理 | 删除"Find Nearby Libraries"功能，页面精简 | React state 清理, 组件拆分 |
| 2026-06-14 | Childcare 页面 | 托儿所搜索页，ACECQA 官方数据替换 OSM 数据 | ACECQA National Register CSV, 自定义 CSV parser, Prisma schema 扩展 |
| 2026-06-14 | ACECQA 数据导入 | 导入 6,303 条 VIC 官方托儿所记录，含质量评级/营业时间 | CSV parsing (quoted fields), Prisma bulk upsert, TypeScript |
| 2026-06-14 | Childcare Geocoding | 6,303 条地址转换成坐标（成功 5,091 条） | Mapbox Geocoding API, 200ms rate limit, 批量更新 |
| 2026-06-14 | Playground 页面 | 游乐场搜索，OSM 数据，设施筛选（围栏/遮阳/BBQ/厕所）| OSM Overpass API, Prisma schema, Tailwind filter UI |
| 2026-06-14 | Hospital 页面 | 医院搜索，急诊筛选，红/蓝标记区分 | OSM Overpass API, Mapbox markers, emergency filter |
| 2026-06-14 | Suburb 综合画像 | /suburb/[name] 页面，Liveability Score 算法（托儿所×30% + 医院×30% + 图书馆×20% + 游乐场×20%）| Mapbox Geocoding, Haversine, Next.js dynamic route, revalidate |
| 2026-06-15 | 地图 Hover Tooltip | 三个地图（托儿所/游乐场/医院）标记点 hover 显示名称 | Mapbox Popup, mouseenter/mouseleave events |
| 2026-06-15 | 点击列表飞到地图 | 点击右侧列表卡片，地图平滑飞到对应位置并显示 popup | useMemo, popupsRef, Mapbox flyTo, useEffect |
| 2026-06-15 | 修复地图重建 Bug | memoize filtered 数组，防止 selectedId 变化触发地图重建 | React useMemo, useRef, dependency array 优化 |
| 2026-06-15 | Playground 命名 | Nominatim 反向地理编码，5,205 条无名游乐场补全名称（97.9% 成功）| OSM Nominatim API, 1 req/s rate limit, 断线重连 |
| 2026-06-15 | Sources 页面 | 数据来源页面，50+ 图书馆链接按州分组展示，CSV 下载 | Next.js 静态页, 手风琴组件, Blob download |
| 2026-06-15 | Navbar 优化 | Liveability 下拉菜单、States 移至末位、点击外部关闭 | React useState, useRef, document.addEventListener |
| 2026-06-16 | 全局 Council 搜索 | 首页搜索框支持全澳洲 council，点击自动切换州并 flyTo 精准位置 | Debounce fetch, Prisma contains insensitive, GeoJSON polling |

---

## 时间轴 Diagram

```
2026-06-10 ──────────────────────────────────────────────────────────────────▶ 2026-06-16
    │                │                │              │           │           │
    │                │                │              │           │           │
 [初始化]        [维州扩展]       [全国扩展]      [Liveability] [UI优化]  [全局搜索]
 Next.js          图书馆           8个州            托儿所       地图Hover  全澳Council
 Prisma           学校学区         NSW/QLD          医院         飞到位置   自动切换州
 Mapbox           AI搜索           学校全国         游乐场       Nominatim  GeoJSON等待
 Events爬取       邮件订阅         States页         Suburb画像   Sources页  精准flyTo
 ABS人口          Council详情      My Events清理    ACECQA数据   Navbar优化
```

### 详细 Diagram（按功能分层）

```
时间线
──────────────────────────────────────────────────────────────────────────────
日期    Jun 10          Jun 12          Jun 13          Jun 14~15       Jun 16
        │               │               │               │               │
        ▼               ▼               ▼               ▼               ▼
─────────────────────────────────────────────────────────────────────────────
数据层  ABS G01        Library         NSW/QLD         ACECQA CSV      —
        人口导入        图书馆hours     学校OSM         6,303托儿所     —
                                       QLD学区         Nominatim命名
─────────────────────────────────────────────────────────────────────────────
API层   /api/councils  /api/libraries  /api/councils   /api/liveability 全局search
        /api/events    /api/schools    (多州)          /nearby          ?search=
─────────────────────────────────────────────────────────────────────────────
地图层  VIC Mapbox     Library pins    多州GeoJSON     Hover popup     flyTo
        区域着色       University pins fitBounds       列表→地图       GeoJSON
        Council点击    学区polygon                     飞到位置        轮询等待
─────────────────────────────────────────────────────────────────────────────
UI层    Council列表    /schools        /states         /childcare      搜索栏
        /events        /my-events      tab切换         /playgrounds    全国化
        /compare       AI搜索          States页        /hospitals
                       邮件订阅                        /suburb/[name]
─────────────────────────────────────────────────────────────────────────────
```

---

## 技术栈汇总

| 类别 | 技术 |
|------|------|
| 前端框架 | Next.js 16 App Router (RSC + Client Components) |
| 数据库 | Prisma 5 + Neon PostgreSQL (serverless) |
| 地图 | Mapbox GL JS — markers, popups, fitBounds, flyTo, GeoJSON layers |
| 样式 | Tailwind CSS v4 |
| AI | Anthropic Claude Haiku (AI 搜索页) |
| 地理编码 | Mapbox Geocoding API (地址→坐标), Nominatim (坐标→名称) |
| 距离计算 | Haversine 公式 (bounding box + 精确距离) |
| 数据来源 | ACECQA (托儿所), OSM Overpass API (医院/游乐场/学校/图书馆), ABS (人口) |
| 邮件 | Resend API |
| 活动爬取 | Python urllib + mylibrary.digital / Humanitix / Eventbrite |
| 自动化 | GitHub Actions cron (每日 1am AEST) |
| 部署 | Vercel + Neon (云端 PostgreSQL) |
