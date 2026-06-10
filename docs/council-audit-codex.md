# Council Activity Source Audit

> 目的：把 `council -> 真实活动来源` 重新审计一遍，避免把 `Eventbrite / Humanitix / mylibrary.digital` 误当成唯一来源。
> 状态：working audit / 可执行版本，后续可继续补证据。

## 核心结论

1. `Eventbrite` 不能默认等于“完整活动源”。很多 council 的官方站点本身就有完整 events 列表，Eventbrite 只是报名入口或其中一个入口。
2. 任何 source 都要先区分：
   - `listing source`：真正承载活动目录的页面
   - `booking source`：最终报名或 ticketing 的页面
3. 有分页的官方目录页，要按“源站分页”抓完，再入库，不要只抓第一页。
4. 未来如果把 100+ library 的 events 都集中到自己的网站，前端不能按“全量列表一次性渲染”来做，必须以分页、过滤、摘要和增量加载为主。

## 先把 source 类型分清楚

| 类型 | 含义 | 例子 |
|---|---|---|
| `official listing` | council / library 自己维护的活动目录 | Canada Bay What's On, Boroondara Library events, Port Phillip What's On |
| `platform listing` | 以第三方平台承载目录，但可能不是全部活动 | Eventbrite, Humanitix, mylibrary.digital |
| `booking only` | 第三方平台只负责报名，不代表完整目录 | Boroondara / Darebin / Brimbank / Canada Bay 的部分场景 |
| `mixed` | 官方目录 + 第三方报名页同时存在 | 很多 council 都属于这个模式 |

## 已确认的典型案例

| Council | 当前文档里的写法 | 真实活动来源判断 | 备注 |
|---|---|---|---|
| Canada Bay | Eventbrite | `official listing` + `Eventbrite booking` | 官方 `What's On` 有分页和 library tag，Eventbrite 不是完整源。 |
| Boroondara | Eventbrite | `official listing` + `Eventbrite booking` | 官方页有完整事件列表和分页，Eventbrite 只是订阅/提醒入口。 |
| Maribyrnong | Eventbrite | `official listing` + `booking mixed` | 官方 `Whats-On` 和 `Events` 页本身就是主目录。 |
| Darebin | Eventbrite | `official listing` + `Eventbrite booking` | 官方活动页和 Eventbrite 事件子页并存。 |
| Frankston | Eventbrite | `official listing` | 官方 `Whats-On` 已经在列活动。 |
| Brimbank | Eventbrite | `official listing` + `Eventbrite booking` | 官方 `browse-all-events` 是主目录，Eventbrite 是注册方式。 |
| Hobsons Bay | Eventbrite | `official listing` | 官方 `What's on` 页面在列活动。 |
| Yarra | Eventbrite | `official listing` + `Eventbrite booking` | 官方页存在，同时 Eventbrite 页面也在用。 |
| Merri-bek | Eventbrite | `official listing` + `Eventbrite booking` | 官方活动页明确指向 Eventbrite，但不能反推 Eventbrite 覆盖全部。 |
| Port Phillip | 自定义 | `official listing` | 官方 library site 有自己的 `What's on` 列表。 |
| Stonnington | mylibrary.digital | `official listing` + `platform listing` | 官方 `What's On` 页本身是对外入口，底层可能由平台驱动。 |
| Whitehorse / Manningham | 共用 WML | `official listing` | 共享 library service 的活动页，不应当拆成两个独立弱来源。 |
| Banyule / Nillumbik / Whittlesea | yprl.vic.gov.au | `regional official listing` | 共享 YPRL 活动体系。 |
| Casey / Cardinia / Greater Dandenong | myli.org.au | `regional official listing` | 共享 regional library 体系。 |
| Moonee Valley | mvcc events site | `official listing` | `libraryevents.mvcc.vic.gov.au` 是自家站点。 |
| Melbourne | 需复核 | `mixed` | 文档里写 Humanitix，但要确认是否只是 booking 或完整目录。 |
| Wyndham | Humanitix | `mixed` | 需要确认是否有官方补充目录页。 |
| Monash | mylibrary.digital | `platform listing` | 现阶段可作为通用平台源。 |
| Bayside / Kingston / Melton / Hume | mylibrary.digital | `platform listing` | 可复用平台抓取，但仍要查是否存在官方补充页。 |

## Melbourne 31 Council 现阶段审计表

> 说明：以下按“当前最可信的真实活动来源”整理。若标记为 `待复核`，表示还需要再查官方站点是否存在更完整的目录页，或者是否只是平台报名页。

| Council | 真实活动来源 | 分类 | 可信度 | 说明 |
|---|---|---|---|---|
| Melbourne | 官方站点 / Humanitix（待复核） | mixed | 中 | 需要确认 Humanitix 是否只是 booking。 |
| Port Phillip | 官方 library site | official listing | 高 | 有自己的 `What's on` 列表。 |
| Stonnington | 官方 `What's On` | official listing | 高 | 页面明确是 library events 主入口。 |
| Yarra | 官方 library site + Eventbrite | mixed | 高 | 官方页和 Eventbrite 并存。 |
| Boroondara | 官方 library events page + Eventbrite | mixed | 高 | 官方页有完整列表和分页。 |
| Manningham | WML shared events page | regional official listing | 中 | 和 Whitehorse 共用体系。 |
| Maroondah | Your Library / mylibrary.digital | platform listing | 中 | 共享 regional platform。 |
| Knox | Your Library / mylibrary.digital | platform listing | 中 | 共享 regional platform。 |
| Monash | mylibrary.digital | platform listing | 高 | 通用平台源。 |
| Whitehorse | WML shared events page | regional official listing | 中 | 和 Manningham 共用体系。 |
| Yarra Ranges | Your Library / mylibrary.digital | platform listing | 中 | 共享 regional platform。 |
| Bayside | mylibrary.digital | platform listing | 高 | 通用平台源。 |
| Glen Eira | 官方 library site | official listing | 中 | 需要补充页面级验证。 |
| Kingston | mylibrary.digital | platform listing | 高 | 通用平台源。 |
| Frankston | 官方 `Whats-On` | official listing | 高 | 官方站已列活动，不应只抓 Eventbrite。 |
| Mornington Peninsula | 官方 library site | official listing | 中 | 待补充页面级验证。 |
| Banyule | YPRL | regional official listing | 高 | 共享 YPRL 体系。 |
| Darebin | 官方 library events + Eventbrite | mixed | 高 | 官方页和 Eventbrite 都存在。 |
| Merri-bek | 官方 library activities + Eventbrite | mixed | 高 | 官方页明确指向 Eventbrite。 |
| Nillumbik | YPRL | regional official listing | 高 | 共享 YPRL 体系。 |
| Whittlesea | YPRL | regional official listing | 高 | 共享 YPRL 体系。 |
| Hume | mylibrary.digital | platform listing | 高 | 通用平台源。 |
| Brimbank | 官方 events + Eventbrite | mixed | 高 | 官方页是主目录，Eventbrite 是报名。 |
| Hobsons Bay | 官方 `What's on` | official listing | 高 | 官方站有自己的活动页。 |
| Maribyrnong | 官方 `What's On` + bookings | official listing | 高 | 官方目录页本身存在，且分页很多。 |
| Melton | mylibrary.digital | platform listing | 高 | 通用平台源。 |
| Moonee Valley | 官方 mvcc library events | official listing | 高 | 自家站点。 |
| Wyndham | Humanitix / official | mixed | 中 | 需要确认是否有更完整官方目录。 |
| Casey | myli.org.au | regional official listing | 中 | 共享 regional library 体系。 |
| Cardinia | myli.org.au | regional official listing | 中 | 共享 regional library 体系。 |
| Greater Dandenong | 官方 library site | official listing | 中 | 待补充页面级验证。 |

## 分页怎么处理

### 1. 抓取策略不要假设“第一页够了”

有些站点分页很深，例如：
- `https://www.maribyrnong.vic.gov.au/library/Whats-On/Events?dlv_OC%20CL%20Libraries%20Events%20Listing=(pageindex=2)`
- `https://www.canadabay.nsw.gov.au/whats-on?page=17`

这种页面的正确处理方式是：

1. 先请求列表页第一页。
2. 解析分页控件，拿到下一页链接或页码。
3. 继续抓取直到：
   - 没有下一页
   - 当前页没有新事件
   - 连续若干页都返回重复事件

### 2. 统一成分页适配器

建议每个 source 配一个 `paginationStrategy`：

| 策略 | 适用情况 | 实现方式 |
|---|---|---|
| `pageParam` | `?page=2` 这种 | 直接递增 page 参数 |
| `pageindexParam` | DLV / 组件分页 | 解析并替换 `pageindex` |
| `nextLink` | HTML 里有 next 按钮 | 直接跟随 next href |
| `monthCalendar` | 月历视图 | 通过月份参数循环抓 |
| `apiCursor` | 有 JSON API | 用 cursor / offset 翻页 |

### 3. 入库时要保存“来源页”而不是只存最终事件

建议至少保留这些字段：

- `sourceName`
- `sourcePageUrl`
- `sourcePageNumber`
- `canonicalEventUrl`
- `externalId`
- `startAt`
- `title`
- `venue`
- `libraryId`

这样做有两个好处：

1. 出问题时能回溯是哪一页漏抓了。
2. 如果同一活动在多个页面重复出现，可以按 `externalId + startAt + venue` 去重。

### 4. recurring events 要按“事件系列 + occurrence”建模

如果一个活动每周重复，比如 storytime，建议不要把它当成很多独立孤立条目。

更稳妥的做法：

- `EventSeries`：活动系列，标题、描述、来源、分类
- `EventOccurrence`：每次发生的时间、地点、报名链接

如果暂时不想加表，也至少在现有 `events` 表里加一个：

- `seriesKey`
- `occurrenceKey`

这样前端不会被重复事件刷爆。

## 如果未来把 100+ library 的 events 都集中到自己网站，怎么存

建议数据库里分三层：

### 1. 原始层

每次抓取都保留原始 payload 或原始 HTML 摘要，方便回放和调试。

### 2. 标准化层

统一字段：
- council
- library
- title
- category
- startAt / endAt
- bookingUrl
- source

### 3. 展示层

为前端预计算：
- 每个 council 的 future event count
- 每个 library 的 upcoming count
- 每天的 event bucket
- 每个 category 的 count

这能避免每次页面请求都扫全表。

## 前端怎么展示，才不会被海量 events 压垮

### 首页

- 只展示摘要，不展示全部事件
- 例如：
  - 本周活动数
  - 近期热门 categories
  - 按 council 的活动热度

### `/events`

建议做成：

1. 默认只显示未来 7 天
2. 支持 `Load more`，不要一次渲染所有条目
3. 按日期分组
4. 顶部放筛选器：
   - council
   - library
   - category
   - date range
5. URL 带 query params，方便分享和 SEO

### `/councils/[slug]`

只展示当前 council 的：

- 顶部 KPI
- 本周 / 本月 upcoming events
- 其余活动通过分页或“查看更多”加载

### `/libraries/[slug]` 或 `?library=`

如果 library 数量非常多，最好再加一个 library 维度页：

- 一个 library 的简介
- 地址和开放时间
- upcoming events 列表

这会比把所有 events 都塞在 council 详情页里更清晰。

### 性能建议

- 列表页用 server-side pagination
- 大表 query 必须加索引：
  - `(councilId, startAt)`
  - `(libraryId, startAt)`
  - `(category, startAt)`
  - `(source, externalId)`
- 热门汇总做 cache 或 materialized view
- 如果以后事件量大，前端只请求“下一页的 20 条”

## 实操建议

1. 先把 `official listing` 和 `booking source` 拆开。
2. 所有带分页的 council 站点，先写 source-specific paginator，再写通用标准化器。
3. 对 100+ library 的场景，不要做“全量单页展示”，要做“摘要 + 过滤 + 分页 + 分组”。
4. 把 `source_page_url` 和 `externalId` 留住，后面排错会省很多时间。

## 下一步建议

- 先对 Melbourne 31 个 council 做一次逐个 source review。
- 然后只挑 2 个最典型的分页站点实现抓取：
  - `Canada Bay` 这种 `?page=N`
  - `Maribyrnong` 这种 `pageindex=N`
- 把这两类 paginator 做通之后，再批量复制到其他 council。
