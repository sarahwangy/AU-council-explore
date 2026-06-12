# Issue 11: Map 页显示 Library 位置 Pin

**优先级：** 中高  
**状态：** 待开始

## 目标

在首页 Mapbox 地图上叠加各 library 的具体位置 pin，点击 pin 显示 library 名称、地址、开放状态。

## 前提

Library 模型已有 `lat` / `lng` 字段（现在大部分为空），需要先 seed 坐标数据。

## 数据 seed（`scripts/seed-library-coords.ts`）

通过 suburb + address 反向 geocode（或直接手动填入坐标）。
优先使用已知地址的 library 直接查 Google Maps 坐标。

## API route（`app/api/libraries/route.ts`）

扩展现有接口，加一个 `GET /api/libraries?all=true` 返回所有有坐标的 library：
```ts
{ id, name, councilId, lat, lng, address, suburb, phone, url, hoursJson }
```

## Map 组件（`components/MapView.tsx` 或 `app/map/page.tsx`）

- 加一个 toggle 按钮："Show Libraries"
- 开启后在地图上叠加蓝色书本 icon pin
- 点击 pin 弹出 popup：名称 / 地址 / 今天开放时间 / 跳转链接

## 验收标准
- [ ] 主要 library 有 lat/lng 坐标
- [ ] 地图上有 library pin toggle
- [ ] 点击 pin 显示基本信息 popup
