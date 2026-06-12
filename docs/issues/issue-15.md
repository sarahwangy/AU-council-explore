# Issue 15: 学校 Zone Checker

**优先级：** 低（复杂，需外部数据）  
**状态：** 待开始

## 目标

用户输入地址，返回该地址对应的政府小学（prep–6）和中学（7–12），以及学校的基本信息（名称、类型、距离）。

## 数据来源

- **Find My School（维州官方）：** `findmyschool.vic.gov.au` — 官方 zone checker，但没有公开 API
- **ACARA My School：** `myschool.edu.au` — 有公开数据下载（年度更新）
- **data.vic.gov.au：** 维州学校坐标 + zone boundary GeoJSON（免费 dataset）

## 实现方案

1. 下载 `data.vic.gov.au` 的 School Zones GeoJSON
2. 用户输入地址 → 调用 Mapbox geocoding API 得到坐标
3. 判断坐标落在哪个 zone polygon 内
4. 返回对应学校信息

## 注意

这是纯维州政府 zoned school，不包括私立/教区学校（那些没有 zone）。

## 验收标准
- [ ] `/tools/school-zone` 页面
- [ ] 输入地址返回政府小学 + 中学
- [ ] 显示学校名、类型、距离
