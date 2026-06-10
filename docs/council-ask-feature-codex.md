# Favorite Library Events Feature

> 目标：让用户选择自己喜欢的 council / library，只看这些收藏对象相关的 events 和 booking events。
> 适用场景：新移民找附近活动、家长看固定图书馆活动、英语学习者追踪某类课程、研究者按区域订阅信息。

## 功能定义

用户可以：

1. 收藏一个或多个 `council`
2. 收藏一个或多个 `library`
3. 只看收藏对象的 upcoming events
4. 在收藏范围内筛选：
   - `event type` / category
   - `booking source`
   - 日期范围
   - 是否只看免费活动
5. 保存一个默认视图，例如：
   - `My councils`
   - `My libraries`
   - `My bookings`

## 推荐做法

### 1. 不要一开始就做复杂账号系统

如果这是 MVP，建议先做两档：

#### A. 无登录版

用本地存储保存收藏：
- `favoriteCouncils`
- `favoriteLibraries`
- `favoriteCategories`

优点：
- 最快上线
- 不需要 auth
- 适合单用户或早期展示

缺点：
- 换设备就没了
- 无法跨设备同步

#### B. 有登录版

后续再加账号体系，把收藏存到数据库。

建议顺序：
1. 先做本地存储版
2. 如果用户真的需要同步，再加登录版

## 数据模型建议

### 最小版

```prisma
model UserPreference {
  id              String   @id @default(cuid())
  userId          String?   // 如果以后有登录系统
  favoriteCouncils Json      // ["monash", "yarra"]
  favoriteLibraries Json      // ["monash-central-library"]
  favoriteCategories Json    // ["children", "english"]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### 更稳妥的版

如果以后收藏对象会变多，建议拆表：

```prisma
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

## 事件查询逻辑

用户进入 “My Events” 页时，查询逻辑应该是：

1. 找出用户收藏的 council 列表
2. 找出用户收藏的 library 列表
3. 查 future events
4. 过滤条件：
   - `councilId IN favorites`
   - `libraryId IN favorites`
   - `startAt >= now()`
5. 再叠加 category / booking source / date range 筛选

### 重要规则

如果用户同时收藏了 council 和 library：

- 默认用 `OR`
- 也就是：只要属于收藏 council，或者属于收藏 library，就显示

如果要更严格，可以提供切换：

- `Match any`：任意命中
- `Match all`：必须同时命中

## Booking event 怎么处理

你提到的 booking event 很重要，建议区分两个概念：

### `listing event`

活动本身的目录项，表示“这活动存在”

### `booking event`

用户真正可以报名的入口，可能是：
- Eventbrite
- Humanitix
- 官方站表单
- 无需报名

### 展示建议

在 event card 上加一个小标签：
- `Book on Eventbrite`
- `Book on Humanitix`
- `No booking required`
- `Official booking`

这样用户一眼能看出这个活动是不是还要跳去第三方。

## 前端页面建议

### 1. 顶部收藏区

在首页或 events 页顶部加一个“我的收藏”区域：

- 已收藏 councils
- 已收藏 libraries
- 一键切换 `My events`

### 2. 侧边栏 / Filter panel

可以加一个收藏筛选区：

- `Favorite councils`
- `Favorite libraries`
- `Favorite categories`
- `Only booking events`
- `Only free events`

### 3. 视图模式

建议提供三种视图：

1. `All events`
2. `My events`
3. `My bookings`

其中：
- `My events` = 收藏范围内的全部活动
- `My bookings` = 只显示有报名入口的活动

### 4. My Events 页面

建议独立一个页面：

- `/my-events`

这个页面默认只显示：
- 未来 7 天
- 收藏 council/library
- 按日期分组

## 如果事件很多，怎么避免前端爆炸

你这个项目会有很多 council、很多 library、很多分页来源，所以前端不能做全量渲染。

### 建议策略

1. 默认只加载 20 条
2. 用 cursor pagination，不要一次拉完
3. `My events` 也做分页
4. 每个 section 先显示 count，再展开列表
5. 收藏越多，默认视图越要收敛

### 典型页面结构

```text
My Events
  - Next 7 days
  - This week
  - This month
  - Favorite councils
  - Favorite libraries
  - Bookings only
```

## 推荐的 API 设计

### GET `/api/me/favorites`

返回当前用户的收藏：

```json
{
  "councils": ["monash", "yarra"],
  "libraries": ["monash-central-library"],
  "categories": ["children", "english"]
}
```

### GET `/api/events`

支持参数：

- `council`
- `library`
- `category`
- `bookingOnly=true`
- `favoritesOnly=true`
- `from`
- `to`
- `cursor`
- `limit`

### GET `/api/my-events`

推荐单独封装一个聚合接口，避免前端自己拼很多条件。

它可以内部做：

- 读取收藏
- 合并过滤
- 返回分组后的结果

这样前端更简单。

## 推荐的数据库索引

如果你要做收藏 + 大量活动查询，索引要提前准备：

- `(councilId, startAt)`
- `(libraryId, startAt)`
- `(category, startAt)`
- `(bookingUrl)`
- `(source, externalId)`

如果加 user 收藏表：

- `(userId, councilId)`
- `(userId, libraryId)`

## 交互建议

### 收藏入口

每个 council card 和 library card 上都放一个星标：

- `☆` 未收藏
- `★` 已收藏

### 收藏后反馈

用户点收藏后，不要只改 icon，最好弹一个轻提示：

- `Added to My events`
- `Showing events from 3 favorite councils`

### 空状态

如果用户收藏为空：

- 提示去 `/councils`
- 推荐几个热门 council
- 引导先收藏 2-3 个对象再看

## 产品建议

### 最小可行版本

先做：
1. 收藏 council
2. 收藏 library
3. My Events 页面
4. booking 标签
5. 本地存储

### 第二阶段

再做：
1. 登录同步
2. 收藏 category
3. 保存 view preset
4. 邮件提醒

### 第三阶段

再做：
1. 对收藏对象的 weekly digest
2. 新活动提醒
3. 按地理位置推荐附近收藏 council

## Multilingual UI

### 难度判断

这个功能**不算特别难**，但前提是你先把 UI 文案和数据展示层拆开。

如果你把所有文字都写死在组件里，后面会变得很难维护；如果你从一开始就把页面文案抽成 key/value，再接一个轻量 i18n 层，难度会明显下降。

### 推荐顺序

1. 先做简体中文
2. 再加英文
3. 后面按需加越南语、印地语

### 为什么适合这个项目

- 你的目标用户里有很多新移民和多元文化社区用户
- library events 本来就很适合用多语言入口去降低使用门槛
- 中文优先能直接提升作品集辨识度

### 实现建议

- 用 `next-intl` 或类似的轻量方案
- 文案不要散落在组件里，统一放到 locale 文件
- 页面中的固定标签都要国际化：
  - 导航
  - 筛选器
  - 空状态
  - 按钮
  - booking 标签

### 真实难点

真正麻烦的不是翻译按钮文字，而是：

- 日期格式
- 分类名称
- 事件详情的长文本
- 搜索结果和过滤条件

所以建议先把“框架文案”国际化，再考虑“内容翻译”。

## 数据可信度

### 问题本质

你前面说得对，**如果更新不准，用户信任会掉得很快**。  
这个项目的核心不是把数据抓到最多，而是让用户觉得“这个站可靠”。

### 解决办法

1. **保留原始链接**
   - 每条活动保留 `originalUrl` 或 `sourceUrl`
   - 用户可以直接点回原站确认
   - 这也能作为爬虫失败时的兜底入口

2. **显示数据来源**
   - 每条活动显示来源标签：
     - `Official`
     - `Eventbrite`
     - `Humanitix`
     - `mylibrary.digital`
   - 让用户知道这条数据从哪里来的

3. **显示抓取时间**
   - 在活动或列表页显示：
     - `Updated 2 hours ago`
     - `Last synced today`
   - 用户会更容易判断数据是否新鲜

4. **保留回源按钮**
   - 不要只展示你站内内容
   - 每条 event/card 都放一个 `View original` 链接

5. **失败时不硬填**
   - 爬虫没抓到，就显示空状态或“暂无数据”
   - 不要猜测、不补假数据

6. **做抓取日志**
   - 每个 source 保留 `scrape log`
   - 包括成功/失败/抓取条数/最后更新时间

### 你提到的做法可不可以

**可以，而且建议保留。**

如果爬虫太多，页面太重，或者某个 source 解析不稳定，直接放原始的 `library link URL` 给用户跳转是合理的兜底策略。

但是建议这样做：

- 站内显示你整理过的标准化数据
- 同时提供原始链接
- 原始链接作为“查看官方页面”入口，不是主展示逻辑

这样用户既能快速浏览，又能自己回到 source 验证。

### 最佳实践

- 站内：给用户摘要、筛选、排序、收藏
- 站外：给用户原始页面核对
- 两者并存，信任感会更高

## 这功能最关键的取舍

1. **先做 localStorage，不要先做账号系统。**
2. **My events 用专门页面，不要塞在总 events 页里。**
3. **booking 与 listing 分开标识，不然用户会以为所有活动都能直接报名。**
4. **收藏对象越多，越要靠分页和 cursor，不要一次性返回全量。**

## 建议的开发顺序

1. 先加 `favorite councils` 的本地存储
2. 再加 `favorite libraries`
3. 再做 `/my-events`
4. 再加 `bookingOnly` 过滤
5. 最后再考虑登录和同步
