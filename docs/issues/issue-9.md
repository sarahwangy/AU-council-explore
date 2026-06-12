# Issue 9: Events 页"适合我"筛选器

**优先级：** 高  
**状态：** 待开始

## 目标

在 Events 页和 Council 详情 Events tab 加快速筛选 tag，让新移民一眼找到适合自己的活动。

## 需要做的

### Schema 变更（`prisma/schema.prisma`）
在 Event 模型新增：
```prisma
isFree          Boolean  @default(true)
requiresBooking Boolean  @default(false)
ageGroup        String?  // "kids-0-5" | "school-age" | "adult" | "senior" | "all-ages"
```

### Migration
```bash
npx prisma migrate dev --name add-event-tags
```

### Events 页 UI（`app/events/page.tsx`）
在现有时间 pill 下方加一行 tag pill：
- `Free` — `isFree = true`
- `Kids (0–5)` — `ageGroup = kids-0-5`
- `School Age` — `ageGroup = school-age`
- `No Booking` — `requiresBooking = false`

点击 pill 加到 URL searchParams，server-side 筛选。

### EventCard badge（`components/EventCard.tsx`）
- 绿色 "Free" badge（当 `isFree = true`）
- 蓝色 age group badge（当有 ageGroup 时）
- 橙色 "Book required" badge（当 `requiresBooking = true`）

### API route 更新（`app/api/events/route.ts`）
支持 `?free=true`, `?ageGroup=kids-0-5`, `?noBooking=true` 参数。

### Scraper 更新
从活动标题/描述推断：
- "free" 出现 → `isFree = true`（默认已是 true）
- "booking required" / "registration required" → `requiresBooking = true`
- "baby", "toddler", "0-5" → `ageGroup = kids-0-5`
- "school holiday", "children" → `ageGroup = school-age`

## 验收标准
- [ ] Events 页有 tag 筛选 pill
- [ ] EventCard 显示 Free/age/booking badge
- [ ] URL 参数驱动，可分享链接
