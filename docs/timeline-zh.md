# 项目开发时间线（中文版）

## 时间表总览

| 日期 | 分支 | 阶段 | 主要内容 |
|---|---|---|---|
| 2026-06-10 | `main` | 初始搭建 | 项目脚手架、Council/Events 核心页面、Mapbox 地图、爬虫 |
| 2026-06-12 | `feat/victoria-expansion` | 维州扩展 | 图书馆、学校学区、AI 搜索、邮件订阅、更多 council 数据 |
| 2026-06-13 上午 | `feat/national-expansion` | 全国扩展 | 8 个州地图、NSW councils、多州 tab 切换 |
| 2026-06-13 下午 | `feat/national-expansion` | 功能打磨 | 图书馆开关状态筛选、States 综合页、学校学区地图 |
| 2026-06-13 晚上 | `feat/national-expansion` | 数据 + 清理 | NSW/QLD/SA 学区数据导入、Events 调试、My Events 清理 |
| 2026-06-13 | `feat/national-expansion` | Liveability | 托儿所/游乐场/医院页面、suburb 综合画像、OSM 数据导入 |

---

## 详细记录

### 2026-06-10 · `main` · 初始搭建

| 时间 | 内容 |
|---|---|
| 项目初始化 | Next.js 16 App Router + Prisma 5 + Neon PostgreSQL + Tailwind CSS |
| 页面搭建 | `/councils` 列表页（区域筛选+搜索）、`/councils/[slug]` 详情页（概览/活动/设施 tab）|
| 活动日历 | `/events` 页面，支持按 council、分类、日期范围筛选 |
| 对比页 | `/compare` 多 council 横向对比 |
| 地图 | Mapbox 首页地图，维州区域着色，点击 council 跳转 |
| API | `/api/councils`、`/api/events`，支持筛选和分页 |
| 爬虫 | `mylibrary.digital`（8 个墨尔本 council）、Humanitix（Wyndham）、Eventbrite（Merri-bek）|
| 自动化 | GitHub Actions 每天凌晨 1 点 AEST 自动爬取 |
| 人口数据 | ABS G01 数据导入脚本，council 人口统计 |

**解决的问题**
- Mapbox council 点击导航
- Council 区域分类（metro / interface / regional）
- ABS LGA 代码格式不匹配问题

---

### 2026-06-12 · `feat/victoria-expansion` · 维州扩展

| 时间 | 内容 |
|---|---|
| 数据库扩展 | 新增 `Library`、`Subscriber`、`CouncilGuide`、`CouncilDemographics` 模型 |
| 图书馆页面 | `/libraries` — 附近搜索、开/关状态、收藏功能（localStorage）|
| 学校学区 | `/schools` — 地址自动补全 + 多边形点内判断（VIC 数据）|
| 地图增强 | 图书馆图钉（📚）、大学图钉（🎓）、动画切换、搜索栏 |
| Council 详情 | ABS 人口统计卡片、新居民指南 tab |
| 邮件订阅 | 订阅/退订流程，使用 Resend 发送 |
| 爬虫升级 | Cron 接口、活动分类标签、导航添加图书馆/学校链接 |
| 更多 council | Geelong、Ballarat、Bendigo、Casey、Wyndham、Frankston，含图书馆分支和 LGA 边界 |
| Activities 页改进 | 关键词搜索、图书馆分支数量统计 |
| AI 搜索 | `/search` — Claude Haiku 驱动，Markdown 渲染，网页搜索工具，结果缓存，双栏布局 |
| Council 搜索 | 输入 3 个字后自动下拉提示 |
| CSV 导出 | Council 列表可导出 CSV |
| My Events | `/my-events` — 收藏图书馆、即将到来的活动、订阅表单 |

**解决的问题**
- `hoursJson` 解析开/关状态（mon-sun 键，HH:MM-HH:MM 格式）
- 活动日期时区处理
- Mapbox 点击跳内部页面 vs 外部地图

---

### 2026-06-13 · `feat/national-expansion` · 全国扩展

#### 上午：全国地图 & 多州数据

| 时间 | 内容 |
|---|---|
| 全国地图 | 8 个州/领地上图；NSW LGA GeoJSON 边界（ABS 2021）|
| 多州 council | `Council` 模型新增 `state` 字段；20 个 NSW council 数据含图书馆链接 |
| StateTabs 组件 | 可复用的州切换 tab，用于 councils/events/libraries 页面 |
| NonVicCouncilCard | 非 VIC council 的外部链接卡片 |
| Councils 页 | 州 tab、NSW 区域筛选、非 VIC 简化布局 |
| Libraries 页 | 州 tab、非 VIC 提示（含各 council 官方图书馆链接）|
| Events 页 | 州 tab、非 VIC 提示 |
| Map 页 | 飞到指定州、多州 GeoJSON、全国视图 |
| 地图修复 | VIC 人口/面积数据、点击跳转内部 council 页、区域统计摘要 |

#### 下午：功能打磨

| 时间 | 内容 |
|---|---|
| 图书馆开关筛选 | 分段按钮（全部 / 🟢 开门中 / 🔴 已关闭），零匹配分组自动隐藏 |
| 营业时间未知 | Council 图书馆详情页显示"Hours unknown"代替空白 |
| States 综合页 | `/states` — 卡片视图 + 可排序表格切换；列：州/人口/面积/councils/图书馆；页脚合计行 |
| 切换州清除搜索 | 切换州 tab 时自动清空搜索输入和结果 |

#### 下午：学校学区地图 & 多州支持

| 时间 | 内容 |
|---|---|
| 学区地图 | `SchoolZoneMap.tsx` — 蓝色/绿色多边形区域，点击弹窗，自适应边界，📍地址图钉 |
| 多州学区搜索 | VIC/NSW/QLD/SA/WA/TAS/NT/ACT 8个州 tab，各州独立地理编码 |
| 邮编提示栏 | 每个州显示邮编范围 + 示例的琥珀色提示框 |
| 修复学区链接 | QLD / SA / TAS 的官方链接 DNS 错误全部修正 |
| 非 VIC 地图图钉 | 非 VIC 州搜索后即使没有学区多边形也显示 📍 图钉 |

#### 晚上：NSW/QLD/SA 学区数据

| 州 | 数据格式 | 初级区数量 | 中学区数量 | 文件大小 |
|---|---|---|---|---|
| NSW | Shapefile | 1,657 | 443 | ~27MB |
| QLD | KML | 1,032 | 274 | ~32MB |
| SA | Shapefile | 84 | 46 | ~1.6MB |

- 转换脚本：`pyshp`（Shapefile）+ `lxml`（KML），统一输出 `{ School_Name, ENTITY_CODE, zoneType }` 格式
- 多州 API：`/api/schools/zone` — 懒加载 + 模块级 `Map` 缓存，避免启动时加载 60MB
- 学区图例修复：只在有数据时显示初级/中学图例

#### 晚上：My Events 清理 & Events 调试

| 内容 | 详情 |
|---|---|
| 删除"附近图书馆" | 从 My Events 页删除 `searchNearby` 函数、所有相关 state 变量和 JSX |
| Events 为空原因 | 爬虫未运行 → 活动日期均已过期（不是数据丢失，而是时间过期）|
| 重新爬取 | 运行 `npx tsx scripts/run-scraper.ts`，获取 396 条活动（4个 council）|
| 爬虫失败原因 | monash/bayside 等：Cloudflare 拦截；Humanitix：400 错误；Eventbrite：`page_size` 参数报错 |

#### Liveability 功能（同日）

| 内容 | 详情 |
|---|---|
| 新增数据表 | `Childcare`、`Playground`、`Hospital` |
| OSM 数据导入 | 293 家医院、6,054 个游乐场、1,258 家托儿所（VIC）|
| `/childcare` | 搜索 suburb，左列表右地图，按服务类型过滤，评级颜色标注 |
| `/playgrounds` | 游乐场地图（🛝图钉），围栏/遮阳/BBQ/厕所 filter |
| `/hospitals` | 红点=急诊/蓝点=普通，Emergency only 筛选，紧急提示 |
| `/suburb/[name]` | 综合生活便利度评分（0-100），四维评分卡，Transit 占位符 |
| `/api/liveability/nearby` | 5km 范围内搜索，支持 childcare/playground/hospital |

**Suburb 评分公式**
```
总分 = 托儿所×30% + 医院×30% + 图书馆×20% + 游乐场×20%
```

**解决的问题**
- `ogr2ogr`/GDAL macOS 链接错误 → 改用 Python `pyshp` + `lxml`
- QLD KML 命名空间：Google KML 非标准 OGC KML
- TypeScript `Set<string>` 不支持索引访问 → 改用 `.has()`
- Prisma `select` + `include` 冲突

---

## 分支对比

| 维度 | `main` | `feat/victoria-expansion` | `feat/national-expansion` |
|---|---|---|---|
| **覆盖范围** | 墨尔本都市区 | 维州全境 | 澳大利亚全国 8 州 |
| **Council 数量** | ~10 个墨尔本 | ~20 个 VIC | ~40 个（VIC + 20 NSW + 其他）|
| **地图** | 墨尔本缩放 | 维州全图 | 全国地图 + 飞到指定州 |
| **图书馆** | 无 | VIC 附近搜索、开放时间 | 多州 tab |
| **学校学区** | 无 | VIC 文字版查找 | 全州 tab + 地图 + NSW/QLD/SA 数据 |
| **活动** | 仅 VIC | 仅 VIC | VIC + 非 VIC 提示 |
| **States 页** | 无 | 无 | 卡片 + 可排序表格 |
| **AI 搜索** | 无 | Claude Haiku + Markdown | 同左 |
| **Liveability** | 无 | 无 | 托儿所/游乐场/医院 + Suburb 综合评分 |
| **数据量** | ~10 个 council | ~20 council + VIC 学区 GeoJSON | +NSW/QLD/SA 学区 (~60MB) + OSM Liveability |

### 关键架构差异
- `feat/national-expansion`：`Council` 模型新增 `state` 字段，需要数据库 migration
- `feat/national-expansion`：懒加载 + 模块级 `Map` 缓存大型 GeoJSON（避免启动时加载 60MB）
- `feat/victoria-expansion`：引入 `LibraryBranch` 和 `hoursJson` 模式，被 national 分支复用
- `feat/national-expansion`：引入 `StateTabs` 通用组件，被多个页面复用
- `feat/national-expansion`：新增 `Childcare`、`Playground`、`Hospital` 三张表 + Liveability 评分体系
