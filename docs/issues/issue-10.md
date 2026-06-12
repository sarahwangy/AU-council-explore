# Issue 10: Library 开放时间 + 今天是否开门

**优先级：** 高  
**状态：** 待开始

## 目标

在 Library 卡片上显示今天的开放时间，以及"现在开门 / 今天关门"状态。

## Schema 变更

```prisma
model Library {
  // 现有字段...
  hoursJson  String?  // JSON string，见格式说明
}
```

### `hoursJson` 格式
```json
{
  "mon": "9:00-18:00",
  "tue": "9:00-18:00",
  "wed": "9:00-20:00",
  "thu": "9:00-18:00",
  "fri": "9:00-18:00",
  "sat": "9:00-17:00",
  "sun": null
}
```
`null` 表示当天关闭。

## Migration
```bash
npx prisma migrate dev --name add-library-hours
```

## 数据 seed（`scripts/seed-library-hours.ts`）
研究各 council library 官网，补充主要分馆的开放时间。
优先覆盖已有数据的 council（31 个 council 的主馆）。

## UI

### Library 卡片（`app/councils/[slug]/page.tsx` Libraries tab）
在每张卡片底部加：
```
今天 Mon  9am – 6pm  ·  🟢 Open now
```
或：
```
今天 Sun  Closed  ·  🔴 Closed today
```

逻辑：
- 读取 `hoursJson`，根据当天星期几取对应时段
- 与当前时间比较，判断是否开门
- 时间用 AEST（UTC+10/+11）

### My Events 页 Library 卡片
同样显示 open/closed 状态。

## 验收标准
- [ ] Library schema 有 `hoursJson`
- [ ] 至少 31 个主馆有开放时间数据
- [ ] Library 卡片显示今天时间 + 开门状态
- [ ] 正确处理 AEST 时区
