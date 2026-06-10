# Melbourne Council Explorer — 任务拆解

> 基于 council-prd.md v1.0
> 执行方式：按 Epic 顺序，每个 Ticket 独立可验证

---

## Epic 0 — 项目初始化

### T00 — 创建 repo 和基础脚手架
**优先级：** P0 | **估时：** 1小时
- [ ] 创建 GitHub repo：`melbourne-council-explorer`（public）
- [ ] `npx create-next-app@latest` 初始化，选 TypeScript + Tailwind + App Router
- [ ] 安装依赖：`prisma`, `@prisma/client`, `cheerio`, `@mapbox/mapbox-gl-js`
- [ ] 配置 `.env.local`：DATABASE_URL, MAPBOX_TOKEN
- [ ] 设置 Neon 数据库，获取连接字符串
- [ ] 初始化 Prisma：`npx prisma init`
- [ ] 写好 README 基础框架（项目介绍、本地启动步骤）
- **验证：** `npm run dev` 正常启动，访问 localhost:3000

---

## Epic 1 — 数据库 Schema 和静态数据

### T01 — Prisma Schema 设计
**优先级：** P0 | **估时：** 1.5小时
- [ ] 在 `prisma/schema.prisma` 定义以下 model：
  ```prisma
  model Council {
    id          String   @id  // slug，如 "monash"
    name        String
    region      String       // inner/eastern/southern/northern/western/outer
    website     String?
    libraryUrl  String?
    libraryPlatform String?  // mylibrary.digital/eventbrite/humanitix/custom
    population  Int?
    areaSqKm    Float?
    stats       CouncilStats?
    libraries   Library[]
    events      Event[]
    createdAt   DateTime @default(now())
  }

  model CouncilStats {
    id              String  @id @default(cuid())
    councilId       String  @unique
    council         Council @relation(fields: [councilId], references: [id])
    malePercent     Float?
    femalePercent   Float?
    medianAge       Int?
    dataYear        Int     @default(2021)  // ABS census 年份
    updatedAt       DateTime @updatedAt
  }

  model Library {
    id        String  @id @default(cuid())
    councilId String
    council   Council @relation(fields: [councilId], references: [id])
    name      String
    address   String?
    suburb    String?
    lat       Float?
    lng       Float?
    events    Event[]
  }

  model Event {
    id          String   @id @default(cuid())
    councilId   String
    council     Council  @relation(fields: [councilId], references: [id])
    libraryId   String?
    library     Library? @relation(fields: [libraryId], references: [id])
    title       String
    description String?
    category    String?  // English/Children/Cultural/Health/Craft 等
    startAt     DateTime
    endAt       DateTime?
    venue       String?
    bookingUrl  String?
    source      String   // mylibrary/eventbrite/humanitix/custom
    externalId  String?  // 第三方平台的原始ID，防重复
    createdAt   DateTime @default(now())
    @@unique([source, externalId])
  }

  model ScrapeLog {
    id        String   @id @default(cuid())
    councilId String?
    source    String
    status    String   // success/error
    count     Int?     // 抓到多少条
    error     String?
    runAt     DateTime @default(now())
  }
  ```
- [ ] `npx prisma migrate dev --name init`
- [ ] `npx prisma studio` 确认表创建成功
- **验证：** Prisma Studio 能看到所有表

### T02 — 导入31个Council基础数据
**优先级：** P0 | **估时：** 2小时
- [ ] 创建 `data/councils.json`，手动整理31个council数据：
  ```json
  [
    {
      "id": "monash",
      "name": "Monash",
      "region": "eastern",
      "website": "https://www.monash.vic.gov.au",
      "libraryUrl": "https://monlib.events.mylibrary.digital",
      "libraryPlatform": "mylibrary.digital"
    },
    ...
  ]
  ```
  参考 `docs/council-问题.md` 中的完整列表
- [ ] 创建 `scripts/seed-councils.ts`，读取 JSON 并写入数据库
- [ ] 运行：`npx tsx scripts/seed-councils.ts`
- **验证：** Prisma Studio 中 Council 表有31条记录

### T03 — 导入 ABS 人口统计数据
**优先级：** P1 | **估时：** 2小时
- [ ] 从 ABS 下载 2021 Census LGA 数据 CSV（网址：abs.gov.au/census）
  - 搜索：Community Profiles → LGA → Victoria
  - 下载 G01 (Selected Person Characteristics) 表
- [ ] 创建 `scripts/import-abs.ts`：
  - 读取 CSV
  - 匹配 LGA 名称到 council slug
  - 写入 CouncilStats 表（人口、性别比、中位年龄）
- [ ] 运行脚本
- **验证：** 查询 `SELECT * FROM "CouncilStats" LIMIT 5` 有数据

---

## Epic 2 — 爬虫系统

### T04 — mylibrary.digital 通用爬虫
**优先级：** P0 | **估时：** 3小时

目标：一个函数，传入不同的 baseUrl，就能爬取对应 council 的活动。

10个目标 URL：
- `https://monlib.events.mylibrary.digital`
- `https://bayside.events.mylibrary.digital`
- `https://stonnington.events.mylibrary.digital`
- `https://humelibraries.events.mylibrary.digital`
- `https://libraryevents.kingston.vic.gov.au`
- `https://libraryevents.melton.vic.gov.au`
- `https://libraryevents.mvcc.vic.gov.au`
- `https://events.yourlibrary.vic.gov.au`（Knox/Maroondah/Yarra Ranges共用）

- [ ] 创建 `scrapers/mylibrary-digital.ts`
- [ ] 分析 `monlib.events.mylibrary.digital` 的 HTML 结构（用浏览器 DevTools）
- [ ] 用 `cheerio` 提取：title, date, time, venue, category, booking URL
- [ ] 写入 Event 表，使用 `@@unique([source, externalId])` 防重复
- [ ] 错误处理：网络超时、解析失败时写入 ScrapeLog 记录
- [ ] 创建 `scripts/run-scraper.ts`，循环调用10个URL
- [ ] 手动运行一次测试
- **验证：** Event 表有 monash council 的活动记录，无重复

### T05 — Eventbrite API 接入
**优先级：** P1 | **估时：** 2小时

目标：通过 Eventbrite API 拉取8个 council 图书馆的活动。

8个 council：Yarra, Boroondara, Frankston, Darebin, Merri-bek, Hobsons Bay, Maribyrnong, Brimbank

- [ ] 注册 Eventbrite 开发者账号，获取 API token（免费）
- [ ] 创建 `scrapers/eventbrite.ts`
- [ ] API 端点：`GET https://www.eventbriteapi.com/v3/organizers/{id}/events/`
  - 需要先找到每个 council 图书馆的 Eventbrite organizer_id
- [ ] 写入 Event 表
- [ ] 加入 `run-scraper.ts`
- **验证：** Event 表有 Yarra council 的活动

### T06 — GitHub Actions 定时爬虫
**优先级：** P1 | **估时：** 1小时
- [ ] 创建 `.github/workflows/scrape.yml`：
  ```yaml
  on:
    schedule:
      - cron: '0 1 * * *'  # 每天凌晨1点（AEST早上11点）运行
    workflow_dispatch:      # 支持手动触发
  jobs:
    scrape:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
        - run: npm ci
        - run: npx tsx scripts/run-scraper.ts
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
  ```
- [ ] 在 GitHub repo Settings → Secrets 添加 DATABASE_URL
- [ ] 手动触发一次，确认运行成功
- **验证：** Actions tab 显示运行成功，数据库有新数据

---

## Epic 3 — API 路由

### T07 — Council 列表和详情 API
**优先级：** P0 | **估时：** 1.5小时
- [ ] `app/api/councils/route.ts`：GET，返回所有council列表（含stats）
- [ ] `app/api/councils/[slug]/route.ts`：GET，返回单个council完整数据
- [ ] 支持 `?region=eastern` 查询参数过滤
- **验证：** 浏览器访问 `/api/councils` 返回JSON

### T08 — Events API
**优先级：** P0 | **估时：** 1.5小时
- [ ] `app/api/events/route.ts`：GET，返回活动列表
- [ ] 支持查询参数：`?council=monash`, `?category=english`, `?from=2026-06-08`, `?to=2026-06-15`
- [ ] 分页：`?page=1&limit=20`
- **验证：** `/api/events?council=monash` 返回 Monash 的活动

---

## Epic 4 — 前端页面

### T09 — 设计系统 / 共用组件
**优先级：** P0 | **估时：** 1小时
- [ ] 定义 CSS 变量（颜色、字体），写入 `app/globals.css`
  - 主色：深蓝 `#1B3A6B`（政府/信任感）
  - 辅色：金黄 `#F4A623`（澳洲感）
  - 背景：`#F8F6F2`
- [ ] 创建 `components/CouncilCard.tsx`：council 卡片组件
- [ ] 创建 `components/EventCard.tsx`：活动卡片组件
- [ ] 创建 `components/RegionBadge.tsx`：区域标签（东区/西区等）
- [ ] 创建 `components/AppNav.tsx`：顶部导航

### T10 — 首页地图 `/`
**优先级：** P0 | **估时：** 3小时
- [ ] 安装并初始化 Mapbox GL JS
- [ ] 获取墨尔本31个LGA的 GeoJSON 边界文件
  - 来源：data.gov.au 或 ABS ASGS boundary files
- [ ] 加载 GeoJSON，按 council 区域着色（东/西/南/北/内城/外围各一色）
- [ ] Hover 高亮：鼠标悬停显示 council 名称和人口
- [ ] 点击跳转：`/councils/[slug]`
- [ ] 右侧图例：区域颜色说明
- **验证：** 地图显示，点击 Monash 跳转到 /councils/monash

### T11 — Council 列表页 `/councils`
**优先级：** P0 | **估时：** 2小时
- [ ] 网格布局：CouncilCard 组件列表
- [ ] 区域筛选 tabs：全部/内城/东区/西区/北区/南区/外围
- [ ] 每张卡片显示：名称、区域标签、人口、图书馆数
- [ ] 搜索框：按 council 名字过滤
- **验证：** 点击"东区"只显示东区 councils

### T12 — Council 详情页 `/councils/[slug]`
**优先级：** P0 | **估时：** 3小时
- [ ] Tab 切换：概览 / 图书馆活动 / 设施
- [ ] **概览 tab：**
  - KPI 卡片：人口/面积/人口密度
  - 性别比 donut chart（纯 SVG，不用库）
  - 年龄分布柱状图（纯 CSS）
  - 数据来源注明：ABS 2021 Census
- [ ] **图书馆活动 tab：**
  - 该 council 图书馆列表
  - 近期活动列表，可按类型筛选
  - "查看全部活动"跳转 `/events?council=xxx`
- [ ] **设施 tab：**
  - Parks 数量（来自 OSM）
  - Childcare 数量（来自政府 API）
  - 小地图显示设施位置（Mapbox）
- **验证：** `/councils/monash` 显示完整数据和活动

### T13 — Events 日历页 `/events`
**优先级：** P1 | **估时：** 2.5小时
- [ ] 默认显示未来7天的活动，按日期分组
- [ ] 筛选器：
  - Council 多选下拉
  - 类型多选（English/Children/Cultural/Health/Craft/Reading）
  - 日期范围选择（今天/本周/本月/自定义）
- [ ] 每条活动显示：标题、图书馆、council标签、时间、分类标签、报名按钮
- [ ] 空状态提示："这个时间段没有符合条件的活动"
- **验证：** 筛选"English"类型，只显示英语课活动

### T14 — Council 对比页 `/compare`
**优先级：** P2 | **估时：** 2小时
- [ ] 最多选择3个council（下拉选择器）
- [ ] 对比维度：人口/面积/人口密度/图书馆数/本月活动数
- [ ] 横向对比表格 + 柱状图
- **验证：** 选择 Monash + Clayton + Glen Waverley，显示对比数据

---

## Epic 5 — OSM 设施数据

### T15 — 导入 Parks 数据（OpenStreetMap）
**优先级：** P2 | **估时：** 2小时
- [ ] 学习 Overpass API 查询语法
- [ ] 创建 `scripts/import-osm-parks.ts`
  - 查询墨尔本所有 `leisure=park` 节点
  - 按经纬度匹配到对应 council
  - 写入数据库 Facility 表（新增）
- [ ] 每月运行一次（加入 GitHub Actions 月度 workflow）
- **验证：** Monash council 的 parks 数量合理（预计20-40个）

---

## Epic 6 — 第二阶段功能（MVP 之后）

### T16 — AI Chat（RAG模式）
**优先级：** P3 | **估时：** 3小时
- [ ] `app/api/chat/route.ts`：接收用户问题
- [ ] 将问题转为 SQL 查询（用 Claude 生成 SQL，再执行）
- [ ] 或向量搜索 events（需要 pgvector）
- [ ] 返回自然语言回答
- 参考 Pinfarer 的 `app/api/ai/chat/route.ts` 实现思路

### T17 — 邮件订阅
**优先级：** P3 | **估时：** 2小时
- [ ] 注册 Resend（resend.com），免费 100封/天
- [ ] 用户输入邮箱 + 选择 council/类型 → 存入数据库
- [ ] GitHub Actions 每周一早上触发，发送本周活动摘要

### T18 — 多语言（中文）
**优先级：** P3 | **估时：** 3小时
- [ ] `next-intl` 或 `next-i18next` 接入
- [ ] 翻译所有 UI 文案到简体中文
- [ ] URL 方案：`/zh/councils` 或 cookie 记住语言偏好

---

## 执行顺序建议

```
Week 1:  T00 → T01 → T02 → T03（项目搭建 + 数据库 + 静态数据）
Week 2:  T04 → T05 → T06（爬虫系统 + 自动化）
Week 3:  T07 → T08 → T09 → T10（API + 首页地图）
Week 4:  T11 → T12 → T13（列表页 + 详情页 + 活动页）
Week 5:  T14 → T15（对比页 + OSM Parks）
Week 6+: T16 → T17 → T18（AI Chat + 订阅 + 多语言）
```

---

## 完成标准（MVP 上线 checklist）

- [ ] 31个council详情页全部有数据
- [ ] ≥20个council的图书馆活动每日自动更新
- [ ] 首页地图可交互
- [ ] Events 页可筛选
- [ ] 移动端可正常浏览
- [ ] GitHub README 有截图和 live demo 链接
- [ ] Vercel 部署成功，可公开访问
