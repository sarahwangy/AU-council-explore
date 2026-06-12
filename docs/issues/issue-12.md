# Issue 12: My Events 页附近 Library 搜索

**优先级：** 中  
**状态：** 待开始

## 目标

在 My Events 页加一个 suburb 搜索框，输入 suburb 名后显示附近的 library 列表（不需要 GPS）。

## UI（`app/my-events/page.tsx`）

在 My Libraries section 下方，或单独一个 "Find a Library" section：

```
[Suburb name...] [Search]

Results:
📚 Bentleigh Library  —  Glen Eira  —  2.1 km*
   161 Jasper Road, Bentleigh
   Mon–Fri 9am–6pm · 🟢 Open now

📚 Cheltenham Library  —  Kingston  —  3.4 km*
   ...
```

*距离估算：suburb 中心点坐标 vs library 坐标，或直接按 suburb 名匹配。

## 实现方案

**简单方案（无 GPS）：**
- 维护一个 `data/suburbs.json`（suburb name → { lat, lng }），约 400 个 Melbourne suburb
- 用户输入 suburb → 匹配坐标 → 计算所有 library 的直线距离 → 返回最近 5 个

**数据来源：**
- Suburb 坐标：`data.gov.au` 或 ABS Suburb Boundaries（免费 GeoJSON，取中心点）
- Library 坐标：来自 Issue 11 seed 的 lat/lng

## API route

`GET /api/libraries/nearby?suburb=Bentleigh` 或 `?lat=xx&lng=xx&radius=5`

返回按距离排序的 library 列表（含 council 信息、开放时间）。

## 验收标准
- [ ] My Events 页有 suburb 搜索框
- [ ] 输入 suburb 返回最近 5 个 library
- [ ] 按距离排序，显示预估距离
- [ ] 显示今天开放时间
