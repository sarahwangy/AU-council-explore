# Issue 13: 新移民指南板块（每个 Council）

**优先级：** 中  
**状态：** 待开始

## 目标

在每个 Council 详情页加一个"新居民指南"tab 或 section，包含实用 checklist，帮助刚搬来的人快速了解这个 council 的基本生活信息。

## 内容

### 通用 checklist（所有 council 相同）
- 📚 **图书馆办卡** — 免费，带护照/ID + 居住证明即可，无需公民身份
- 🗑 **垃圾桶颜色** — 黄盖（recyclables）/ 绿盖（garden/food waste）/ 红盖（general waste）
- 🏥 **找 GP（家庭医生）** — 注册 Medicare 后可以 bulk bill，基本不花钱
- 🧒 **幼儿园申请** — 3岁 kindergarten 在 council 登记，建议生完孩子就登记（排队长）
- 🚮 **Hard rubbish** — 每年约 1~2 次，大件废物免费收走，具体日期见 council 官网

### 每个 council 特有字段（`data/councils.json` 扩展）
```json
{
  "hardRubbishUrl": "https://www.glen-eira.vic.gov.au/...",
  "kindergartenUrl": "https://www.glen-eira.vic.gov.au/...",
  "libraryCardUrl": "https://library.gleneira.vic.gov.au/join"
}
```

## UI

在 Council 详情页新增第 4 个 tab：**"New Resident"** / **"新居民"**（多语言）

3列布局，每个 item 用 card 展示：icon + 标题 + 一句话说明 + 链接按钮。

## 验收标准
- [ ] Council 详情页有"New Resident"tab
- [ ] 通用 checklist 5 项全部显示
- [ ] 至少有外链到该 council 相关页面
- [ ] 中英文均支持
