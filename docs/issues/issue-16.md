# Issue 16: Events 免费活动 Badge + Free 专区

**优先级：** 高  
**状态：** 待开始（与 Issue 9 一起做）

## 目标

- 在每个 EventCard 上加醒目的"Free"绿色 badge
- 在 Events 页加"Free Events"快速筛选
- 加一段说明文字告知用户：council library 活动几乎全部免费

## 实现

### EventCard（`components/EventCard.tsx`）
在 category badge 旁边加绿色 Free badge：
```
[🟢 Free]  [Storytime]  [Eventbrite]
```

当 `isFree = true`（默认 true）时显示。

### Events 页说明文字（`app/events/page.tsx`）
在筛选器上方加一行：
```
💡 Council library events are almost always free — no cost to attend.
```

### Council 详情 Events tab
同样加说明文字。

## 依赖
- 依赖 Issue 9 的 `isFree` 字段

## 验收标准
- [ ] EventCard 有 Free badge
- [ ] Events 页有说明文字
- [ ] Free 筛选 pill 正常工作
