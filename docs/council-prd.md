# Melbourne Council Explorer — Product Requirements Document (PRD)

> 版本：v1.0
> 日期：2026-06-08
> 状态：草稿

---

## 1. 产品概述

### 1.1 产品名称
**Melbourne Council Explorer**（暂定，后续可改）

### 1.2 一句话描述
整合墨尔本31个 council 的人口数据、图书馆活动、社区设施的公开查询平台。

### 1.3 目标用户
| 用户类型 | 核心需求 |
|---|---|
| 新移民/刚到墨尔本 | 比较各区生活配套，选择居住地 |
| 有小孩的家庭 | 找 childcare、图书馆 storytime、kids events |
| 学英语/寻求社区支持 | 找 English class、SEW、Conversation Circle |
| 买房选区的人 | 横向对比各 council 设施和人口结构 |
| 研究人员/记者 | 获取结构化的 council 数据 |

### 1.4 项目定位
- **第一阶段（MVP）：** 个人使用 + 求职作品集展示
- **第二阶段：** 对外公开，服务墨尔本华人及多元文化社区

---

## 2. 竞品分析

| 竞品 | 覆盖内容 | 不足 |
|---|---|---|
| 各 council 官网 | 只有本 council 数据 | 无法横向比较，找活动要逐个找 |
| ABS Census Explorer | 人口统计数据 | 无活动、无设施信息，界面复杂 |
| Google Maps | POI 搜索 | 无 council 维度汇总，无活动数据 |
| Whatson Melbourne | 活动信息 | 不按 council 分类，无社区资源 |

**差异化优势：** 唯一把人口数据 + 图书馆活动 + 社区设施整合到 council 维度的工具。

---

## 3. 数据来源

| 数据类型 | 来源 | 费用 | 更新频率 |
|---|---|---|---|
| 人口/面积/性别/年龄 | ABS Census 2021 CSV | 免费 | 5年/次 |
| 图书馆 events（10 councils） | mylibrary.digital 爬虫 | 免费 | 每日 |
| 图书馆 events（8 councils） | Eventbrite API | 免费 | 每日 |
| 图书馆 events（2 councils） | Humanitix API | 免费 | 每日 |
| Parks / 图书馆位置 | OpenStreetMap Overpass API | 免费 | 每月 |
| Childcare 数量 | Child Care Finder API（政府） | 免费 | 每季度 |
| 餐厅/商场/教堂数量 | Google Places API（可选） | 付费 | 每月 |
| Council 基础信息 | 手动整理 JSON | 免费 | 一次性 |

---

## 4. 功能需求

### 4.1 MVP 功能（第一阶段）

#### F1 — 首页地图
- 墨尔本地图，31个council区域多边形着色
- 点击council进入详情页
- 颜色可按"人口密度"/"图书馆活动数"等指标切换

#### F2 — Council 列表页 `/councils`
- 所有31个council卡片展示
- 可按区域筛选（内城/东区/西区/北区/南区/外围）
- 每张卡片显示：名称、区域标签、人口、图书馆数量、近期活动数

#### F3 — Council 详情页 `/councils/[slug]`
- **概览 tab：** 人口总数、面积（km²）、人口密度、性别比、年龄分布柱状图
- **图书馆 tab：** 本council图书馆列表（名称+地址+开放时间）、近期events列表（标题/时间/地点/分类）
- **设施 tab：** Parks数量+地图标注、Childcare数量、按OSM数据展示

#### F4 — 全墨尔本 Events 日历 `/events`
- 聚合所有council图书馆活动
- 可按类型筛选（English class / Children / Cultural / Health 等）
- 可按council筛选
- 可按日期筛选（今天/本周/本月）
- 每条事件显示：标题、图书馆名、council、时间、分类标签、跳转报名链接

#### F5 — Council 对比页 `/compare`
- 选择2-3个council横向对比
- 对比维度：人口、面积、图书馆数量、本月活动数、Parks数量

### 4.2 第二阶段功能

#### F6 — 按位置搜索
- 用户输入地址/suburb，推荐附近council
- 显示"距你最近的图书馆今天有什么活动"

#### F7 — AI Chat（RAG模式）
- 用自然语言查询数据库
- 示例："哪个council英语课最多？""Clayton附近有没有免费儿童活动？"
- 技术：Claude API + 向量搜索或SQL生成

#### F8 — 邮件订阅
- 用户订阅某个council或某类活动
- 每周推送新活动摘要
- 技术：Resend API（免费tier：100封/天）

#### F9 — 多语言支持
- 中文界面（简体）
- 后续可扩展越南语、印地语

#### F10 — 数据导出
- 支持导出council数据为CSV
- 面向研究人员/记者用户

---

## 5. 非功能需求

| 类别 | 要求 |
|---|---|
| 性能 | 列表页首屏 < 2秒，详情页 < 3秒 |
| 移动端 | 全站响应式，支持手机浏览 |
| 可访问性 | 基本 WCAG AA 标准 |
| SEO | 每个council详情页有独立URL和meta信息 |
| 数据新鲜度 | Events 每日更新，人口数据标注数据年份 |
| 开源 | GitHub public repo，方便求职展示 |

---

## 6. 技术架构

### 6.1 技术栈
| 层 | 技术 |
|---|---|
| 框架 | Next.js 14 App Router + TypeScript |
| 数据库 | PostgreSQL（Neon，免费tier） |
| ORM | Prisma |
| 爬虫 | Node.js fetch + Cheerio |
| 地图 | Mapbox GL JS |
| 样式 | Tailwind CSS |
| 定时任务 | GitHub Actions（每日 cron） |
| 部署 | Vercel |
| AI Chat | Claude API（claude-haiku，按需） |
| 邮件 | Resend |

### 6.2 数据库核心表
```sql
councils          -- 31个council基础信息
libraries         -- 图书馆位置和基本信息
events            -- 所有爬取的图书馆活动
facilities        -- Parks/Childcare等设施（来自OSM）
council_stats     -- ABS人口统计数据
scrape_logs       -- 爬虫运行记录
```

### 6.3 目录结构
```
melbourne-council-explorer/
├── app/
│   ├── page.tsx              # 首页地图
│   ├── councils/
│   │   ├── page.tsx          # 列表页
│   │   └── [slug]/page.tsx   # 详情页
│   ├── events/page.tsx       # 全市活动
│   ├── compare/page.tsx      # 对比页
│   └── api/
│       ├── councils/         # Council数据API
│       ├── events/           # Events API
│       └── chat/             # AI Chat API
├── scrapers/
│   ├── mylibrary-digital.ts  # 通用爬虫（10 councils）
│   ├── eventbrite.ts         # Eventbrite API（8 councils）
│   ├── humanitix.ts          # Humanitix API（2 councils）
│   └── custom/               # 自定义爬虫（9 councils）
├── scripts/
│   ├── import-abs.ts         # 导入ABS人口数据
│   └── import-osm.ts         # 导入OSM设施数据
├── prisma/
│   └── schema.prisma
└── docs/
    ├── council-问题.md
    ├── council-prd.md
    └── council-ticket.md
```

---

## 7. MVP 交付范围

### 包含（In Scope）
- 31个council基础数据页面
- mylibrary.digital爬虫（覆盖10个council的events）
- Eventbrite API接入（8个council）
- ABS人口统计展示
- OSM Parks/设施数据
- 地图首页
- Events筛选日历
- Council对比页

### 不包含（Out of Scope for MVP）
- 用户登录/账号系统
- AI Chat
- 邮件订阅
- 多语言
- Google Places API（餐厅/商场）
- 自定义网站爬虫（9个council）
- 学校/房价数据

---

## 8. 成功指标

| 指标 | 目标 |
|---|---|
| 覆盖 council 数量 | 全部31个 |
| Events 覆盖率 | ≥ 20/31 个 council（使用通用方案的） |
| 数据更新频率 | Events 每日自动更新 |
| 求职展示效果 | GitHub README 清晰，有截图和 live demo URL |

---

## 9. 风险与对策

| 风险 | 概率 | 对策 |
|---|---|---|
| 爬虫被 council 网站封锁 | 中 | 加请求间隔，User-Agent伪装，优先用官方API |
| mylibrary.digital 平台改版 | 低 | 监控爬虫成功率，报警机制 |
| ABS 数据较旧（2021年） | 确定 | 页面明确标注数据年份，2026年 census 后更新 |
| Google Places API 费用超支 | 低 | MVP阶段不接，改用OSM |
