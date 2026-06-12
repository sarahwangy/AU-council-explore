# Issue 14: Hard Rubbish 收集日期

**优先级：** 低  
**状态：** 待开始

## 目标

在每个 Council 详情页（Overview tab 或 New Resident tab）显示 hard rubbish 收集信息：下次收集的大约日期或如何预约。

## 数据

每个 council 的 hard rubbish 政策不同：
- 有的是按区域轮换的固定周（如 Glen Eira 每年按 zone 分配）
- 有的是需要预约（如 Boroondara 在线预约）
- 有的是随叫随到（limited）

**数据收集方式：** 手动研究各 council 官网，填入 `data/councils.json`：
```json
{
  "hardRubbishType": "zone-based" | "booking" | "on-demand",
  "hardRubbishUrl": "https://...",
  "hardRubbishNote": "Zone A: March, Zone B: September"
}
```

## UI

在 Overview tab 的 stat 卡片区下方，或 New Resident tab 中，显示：
```
🚮 Hard Rubbish
Zone-based collection · Zone A: March
[Book / View schedule →]
```

## 验收标准
- [ ] `data/councils.json` 有 hardRubbish 字段
- [ ] Council 详情页显示 hard rubbish 类型和链接
