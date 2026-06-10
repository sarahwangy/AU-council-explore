# Melbourne Council Explorer — 前期问答记录

> 记录时间：2026-06-08
> 项目背景：为墨尔本用户构建一个整合31个council数据的公开查询工具，兼顾自用和求职作品展示。

---

## Q1：这个功能放 Pinfarer 里面，还是单独开个 repo？

**答：单独开新 repo。**

Pinfarer 是"个人旅行地图"，Melbourne council 数据是"城市信息查询工具"，受众和目的完全不同。放一起会让 Pinfarer 变成杂货铺，维护混乱。

---

## Q2：数据来源是什么？需要爬虫吗？需要 Google Maps API 吗？

### 人口 / 面积 / 男女比例
- **不需要爬虫。** 使用 ABS（澳大利亚统计局）census 数据，可直接下载 CSV，完全免费。
- 更新频率：每5年（2021年最近一次，2026年下一次）

### Parks / 图书馆 / Church / Shopping Centre
| 方案 | 优点 | 缺点 |
|---|---|---|
| Google Maps Places API | 数据最全最新 | 有费用，每1000次请求约$17 USD |
| OpenStreetMap Overpass API | 完全免费 | 餐厅数据没 Google 全 |
| 爬虫各 council 网站 | 有独家数据 | 每个网站结构不同，维护成本高 |

**建议：** Parks/Library/Church/Shopping 用 OpenStreetMap（免费），餐厅数量用 Google Places API（或接受不完整）。

### Library Events
- 10个council使用 **mylibrary.digital** 平台 → 一套爬虫搞定
- 8个council使用 **Eventbrite** → 有公开API，统一处理
- 2个council使用 **Humanitix** → 有API
- 剩余9个council用自定义网站 → 各自单独写

### SEW / English class / Seed / Childcare
- Childcare：Australian Government 有 Child Care Finder API（官方开放）
- SEW/English/Seed：无统一 API，只能爬各 council 网站或手动整理，**这部分自动化最难**

---

## Q3：Melbourne 一共有多少 Council？分哪些区？

大墨尔本地区共 **31 个 LGA（Local Government Area）**：

| 区域 | Councils |
|---|---|
| 内城 Inner | Melbourne, Port Phillip, Stonnington, Yarra |
| 东区 Eastern | Boroondara, Manningham, Maroondah, Knox, Monash, Whitehorse, Yarra Ranges |
| 南区 Southern/Bayside | Bayside, Glen Eira, Kingston, Frankston, Mornington Peninsula |
| 北区 Northern | Banyule, Darebin, Merri-bek, Nillumbik, Whittlesea, Hume |
| 西区 Western | Brimbank, Hobsons Bay, Maribyrnong, Melton, Moonee Valley, Wyndham |
| 外围 Outer | Casey, Cardinia, Greater Dandenong |

---

## Q4：31个council的图书馆网址调查结果

### 平台分布

| 平台 | Council数量 | 说明 |
|---|---|---|
| **mylibrary.digital / Solus** | **10** | 一套爬虫搞定 |
| 自定义网站 | 9 | 各自处理 |
| Eventbrite | 8 | 有API，统一处理 |
| Humanitix | 2 | 有API，统一处理 |

**结论：三套通用方案覆盖 20/31 个 council。**

### 完整列表

| Council | 区域 | Events URL | 平台 |
|---|---|---|---|
| Melbourne | Inner | melbourne.vic.gov.au/libraries | Humanitix |
| Port Phillip | Inner | library.portphillip.vic.gov.au/whats-on | 自定义 |
| Stonnington | Inner | stonnington.events.mylibrary.digital | **mylibrary.digital** |
| Yarra | Inner | library.yarracity.vic.gov.au/whats-on | Eventbrite |
| Boroondara | Eastern | boroondara.vic.gov.au/library-events | Eventbrite |
| Manningham | Eastern | wml.vic.gov.au/Events-directory | 自定义（共用） |
| Maroondah | Eastern | events.yourlibrary.vic.gov.au | **mylibrary.digital** |
| Knox | Eastern | events.yourlibrary.vic.gov.au | **mylibrary.digital** |
| Monash | Eastern | monlib.events.mylibrary.digital | **mylibrary.digital** |
| Whitehorse | Eastern | wml.vic.gov.au/Events-directory | 自定义（共用） |
| Yarra Ranges | Eastern | events.yourlibrary.vic.gov.au | **mylibrary.digital** |
| Bayside | Southern | bayside.events.mylibrary.digital | **mylibrary.digital** |
| Glen Eira | Southern | library.gleneira.vic.gov.au/whats-on | 自定义 |
| Kingston | Southern | libraryevents.kingston.vic.gov.au | **mylibrary.digital** |
| Frankston | Southern | library.frankston.vic.gov.au/Whats-On | Eventbrite |
| Mornington Peninsula | Southern | library.mornpen.vic.gov.au/Whats-On | 自定义 |
| Banyule | Northern | yprl.vic.gov.au/events | 自定义（共用） |
| Darebin | Northern | libraries.darebin.vic.gov.au | Eventbrite |
| Merri-bek | Northern | merri-bek.vic.gov.au/libraries | Eventbrite |
| Nillumbik | Northern | yprl.vic.gov.au/events | 自定义（共用） |
| Whittlesea | Northern | yprl.vic.gov.au/events | 自定义（共用） |
| Hume | Northern | humelibraries.events.mylibrary.digital | **mylibrary.digital** |
| Brimbank | Western | brimbanklibraries.vic.gov.au | Eventbrite |
| Hobsons Bay | Western | libraries.hobsonsbay.vic.gov.au | Eventbrite |
| Maribyrnong | Western | maribyrnong.vic.gov.au/library | Eventbrite |
| Melton | Western | libraryevents.melton.vic.gov.au | **mylibrary.digital** |
| Moonee Valley | Western | libraryevents.mvcc.vic.gov.au | **mylibrary.digital** |
| Wyndham | Western | events.humanitix.com/host/wyndham-libraries | Humanitix |
| Casey | Outer | myli.org.au/events | 自定义（共用） |
| Cardinia | Outer | myli.org.au/events | 自定义（共用） |
| Greater Dandenong | Outer | libraries.greaterdandenong.vic.gov.au | 自定义 |

---

## Q5：项目技术栈是什么？难吗？

### 推荐技术栈

| 层 | 技术 | 原因 |
|---|---|---|
| 框架 | Next.js 14 + TypeScript | 和 Pinfarer 一样，已熟悉 |
| 数据库 | PostgreSQL（Neon，免费） | 支持搜索/过滤，不需要 Supabase Auth |
| 爬虫 | Node.js fetch + Cheerio | 轻量，无需无头浏览器 |
| 地图 | Mapbox GL JS | 和 Pinfarer 一样 |
| 定时任务 | GitHub Actions（每日更新） | 免费，自动化 |
| 部署 | Vercel | 免费 |

### 难度评估

| 模块 | 难度 |
|---|---|
| 静态数据（人口/面积） | ⭐ 低 |
| mylibrary.digital 爬虫 | ⭐⭐ 中 |
| Eventbrite API | ⭐⭐ 中 |
| 地图展示 | ⭐⭐ 中 |
| 自定义网站爬虫 | ⭐⭐⭐ 高 |
| AI Chat（RAG） | ⭐⭐ 中（有 Pinfarer 经验） |

**整体：中等难度。** 比 Pinfarer 工程量大，但没有从未见过的技术。

---

## Q6：有哪些展示页面？

```
/                     首页 — 墨尔本地图，31个council区域着色
/councils             列表页 — 所有council卡片，可按区域筛选
/councils/[slug]      详情页
  ├── 概览 tab        人口/面积/性别比/年龄分布
  ├── 图书馆 tab      图书馆列表 + 近期 events
  ├── 设施 tab        Parks/Childcare/Church 数量 + 地图
  └── 社区资源 tab    SEW/English class/Seed 等
/events               全墨尔本 events 日历，可按类型/council筛选
/compare              对比页 — 选2-3个council横向比较
/map                  地图模式 — 热力图展示各类设施密度
```

---

## Q7：对墨尔本用户实用吗？

**非常实用，特别适合：**
- 🏠 新移民/刚到墨尔本 — 不知道住哪个区，想比较 council
- 👶 有小孩的家庭 — 找 childcare、图书馆 storytime
- 📚 学英语的人 — 找 English class、SEW、Conversation Circle
- 🌏 华人社区 — 很多人不知道图书馆有这么多免费活动
- 🏡 买房选区 — 看各区配套设施差异

**现有竞品：无。** 没有一个网站把这些数据整合在一起。

---

## Q8：找工作适合展示吗？

**非常适合，比 todo app 强很多：**

| 展示点 | 对应技能 |
|---|---|
| 自己写爬虫抓数据 | 数据工程，理解 HTTP/HTML |
| 多数据源整合 | API 集成，数据清洗 |
| 定时任务自动更新 | DevOps，GitHub Actions |
| 地图可视化 | 前端高级功能 |
| 解决本地真实问题 | 产品思维（澳洲雇主喜欢） |
| RAG AI Chat | 最受关注的 AI 工程技能 |

---

## Q9：还可以加哪些 Feature？

**实用类：**
- 📧 邮件订阅 — 订阅某 council 的 events，每周推送
- 🔔 新 event 提醒 — "Glen Waverley Library 有新的 English class"
- 📍 按位置推荐 — "离你最近的3个图书馆今天有什么"
- 🌐 多语言 — 中文/越南语/印地语界面
- 📊 数据下载 — 导出 CSV 给研究人员/记者用

**数据类：**
- 🏫 学校数据 — 公校/私校，NAPLAN 评分
- 🚌 交通数据 — PTV 接入，看公共交通便利程度
- 💰 房价趋势 — 接 Domain/REA API

---

## Q10：需要 AI Chat 吗？

**建议加，但要做成 RAG 模式（不是普通聊天）：**

用户用自然语言提问，AI 查询你自己的数据库回答：

- "哪个 council 图书馆活动最多？" → 查数据库，给出排名
- "我住 Clayton，附近有没有免费英语课？" → 定位 + 筛选
- "这周末 Monash 有什么适合带小孩的活动？" → 查 events 表

这叫 **RAG（Retrieval-Augmented Generation）**，是目前最受雇主关注的 AI 工程技能。

---

## Q11：哪些功能需要花钱？

| 功能 | 费用 | 备注 |
|---|---|---|
| AI Chat（Claude API） | 按 token 收费 | 可控，轻度使用几十元/月 |
| Google Places API | ~$17 USD/千次 | **可选**，OSM 可替代 |
| 邮件订阅（Resend） | 免费100封/天，超出收费 | 早期完全免费 |
| 域名 | ~$15 AUD/年 | 可选 |
| **Neon 数据库** | **免费** | 免费 tier 够用 |
| **Vercel 部署** | **免费** | 免费 tier 够用 |
| **GitHub Actions** | **免费** | 公开 repo 免费 |
| **ABS 数据** | **免费** | 官方开放数据 |
| **OSM/Overpass** | **免费** | 开源地图 |
| **mylibrary.digital 爬虫** | **免费** | 普通 HTTP 请求 |
| **Eventbrite API** | **免费** | 有免费 tier |

**结论：不加 Google Places + 暂不加 AI Chat = 完全免费运行。**



1. 比想象中简单很多
全澳 127 个 council，其中 49 个只需要在现有爬虫配置里加一行——因为它们用的是 mylibrary.digital、Humanitix 或 Eventbrite，爬虫代码完全复用。

2. Ballarat + Bendigo 是最快的扩展

Ballarat 用 Humanitix（Melbourne 已经接了）
Bendigo 用 Eventbrite（Melbourne 已经接了）
两个城市合计工作量不超过 1 天
3. 最难的是 Sydney 和 Perth
两个城市加起来有 28 个自定义网站，需要各自写爬虫。但可以分批做，先覆盖人口大的 council。

4. 有个新平台要研究
Geelong 用 Communico，是图书馆专用 SaaS，跟 mylibrary.digital 类似。研究一次，未来如果其他 council 也用这个平台就可以直接复用。