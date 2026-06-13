现在（你来做，约15分钟）
  ① 去 neon.tech 创建免费数据库，复制 DATABASE_URL
  ② 创建 .env.local，填入 DATABASE_URL + MAPBOX_TOKEN
  ③ npx prisma migrate dev --name init
  ④ npx tsx scripts/seed-councils.ts
  ⑤ 下载 ABS G01 CSV（人口数据）→ npx tsx scripts/import-abs.ts
  ⑥ npx tsx scripts/import-abs-g04.ts   ← G04 文件已经下好了 ✅
  ⑦ npm run dev  →  看前端效果

数据库跑通后，我来做
  Phase 2a：收藏功能（localStorage + /my-events 页面）
  Phase 2b：多语言支持（next-intl，先中文）



  # 建数据库表
npx prisma migrate dev --name init

# 导入 31 个 council 基础数据
npx tsx scripts/seed-councils.ts

# 导入 ABS 人口数据（需要先下载 G01 CSV）
# 下载地址：https://www.abs.gov.au/census/find-census-data/community-profiles/2021/LGA
# 选 Victoria → G01 → CSV → 保存到 data/abs-lga-2021.csv
npx tsx scripts/import-abs.ts

# 导入年龄段数据（G04 文件已经下好了 ✅）
npx tsx scripts/import-abs-g04.ts


能看到什么
页面	效果
/councils	31 个 council 卡片，有人口数据，有收藏星标
/councils/monash	人口、面积、性别分布、年龄段进度条
/events	空（爬虫还没跑过）
/my-events	空状态引导页
导航右侧	中文 切换按钮
Events 页要有数据，需要手动跑一次爬虫：


npx tsx scripts/run-scraper.ts
（需要 EVENTBRITE_TOKEN 和 HUMANITIX_API_KEY 可选，没有也能跑 mylibrary.digital 部分）



🔴 马上要做（影响上线）
#	功能	原因
1	Vercel 部署	现在只能本地跑，没有真实用户
2	Subscribe bug 修复	重启 dev server 就好，但上线前要测通
3	GitHub Actions 自动爬虫	现在 events 数据只能手动跑，需要每天自动抓
4	只有 4 个 council 有数据	Kingston/Melton/Maroondah/Moonee Valley，其他 27 个空的
🟡 近期要做（用户体验）
#	功能
5	Playwright scraper 跑通
6	


7	Council 详情页 Events tab
8	搜索功能
9	SEO / og:image
🟢 之后扩展（Phase 2+）
#	功能
10	ABS 文化多样性数据（海外出生、家庭语言）
11	ABS 社会经济数据（家庭收入、租房比例）
12	Ballarat + Bendigo（Phase 2 扩展）
13	域名 + 自定义邮件发件人
14	Council Ask 功能（问社区问题）
我的建议顺序：

先修 Subscribe → 测通邮件
部署 Vercel
加 GitHub Actions 自动爬





下一步功能建议：

马上能做（1-2小时）

功能	说明
填入 hardRubbish / kinder / libraryCard URL	研究 31 个 council，完善 New Resident tab 的链接
Library 分馆开放时间	现在只有主馆有，其他分馆显示空。可以复制相同 council 的时间或标注"请查官网"
Events 页 Free badge 的 scraper 逻辑	现在全部默认 isFree=true，需要从描述里检测 requiresBooking
中等工作量（半天）

功能	说明
Map 上显示 Library pin（Issue 11）	需要先 seed 经纬度坐标
附近 Library 搜索（Issue 12）	输入 suburb 找最近的 library
多语言 Events 筛选（普通话/越南语活动）	部分 library 有专门的文化活动，标注出来对新移民很有用
更大价值但需要数据（1-2天）

功能	说明
更多 council 的 event 爬虫	现在只有 4 个，27 个是空的。最有价值的改进
幼儿园/学校 zone checker（Issue 15）	输入地址查能上哪所学校，对有孩子的家庭极有价值
ABS 海外出生人口 / 语言数据	显示每个 council 有多少新移民、主要语言
你最想先做哪个？


Mapbox token 保护步骤：

登录 mapbox.com
找到你的 token → 点击编辑（或新建一个 production token）
在 "Allowed URLs" 里添加：

https://au-council-explore.vercel.app
https://*.vercel.app
本地开发另建一个不限制 URL 的 token，放在 .env.local
Vercel 生产环境用限制了 URL 的 token
这样别人拿到 token 在自己网站用，Mapbox 会返回 403。


数据完整性（影响最大）

区域城市的 Events 数据 — Geelong/Ballarat/Bendigo 目前没有任何活动，需要爬取或手动添加
更多大学 — La Trobe 有 Bendigo 校区，Federation University 主校区在 Ballarat，目前地图上没有显示
更多维州城市 — Casey、Wyndham、Frankston 等人口大区还没加
地图体验
4. 地图搜索框 — 用户想直接搜索 "Geelong" 跳转，目前只能点击或从列表进
5. Council 详情页返回地图 — 点击"在地图上查看"直接 fly to 该 council

Council 详情页
6. New Resident 页 — 目前 Geelong/Ballarat/Bendigo 三个新城市的 bin colours、hard rubbish 链接还没填
7. Hard rubbish 具体日期 — 所有城市都缺，只有链接

移动端
8. 移动端地图 legend 遮挡 — 在小屏上 legend 会遮住地图内容，需要折叠



----

各页面改动方案 （不需要动任何VIC 相关的UI ，只需要加扩展相关的）
1. 地图页（/）
目前 legend 只有 VIC 的 region。
扩展后：

顶部加 State 切换 tabs：VIC | NSW | QLD | SA | WA ...
切换 state 时地图飞到对应州，legend 显示该州的 region 分组
其他州的 council polygon 颜色稍浅，表示"有基本信息但无活动数据"
搜索框也按 state 范围缩小结果
同样的需要展示每个州图书馆位置，大学位置，其他州的图书馆也显示一个浅色点，点击弹出信息卡片（名称 + 访问官网按钮）


2. Council 列表页（/councils）
目前是单一列表。
扩展后：

顶部 State 筛选 tabs（同地图页联动）
VIC council 卡片：显示活动数量、图书馆数量（现有） -- 不需要动任何VIC 相关的UI
其他州 council 卡片：显示人口、面积，右下角一个 "Library Website →" 按钮，新 tab 打开，除了没有eventstab以外，其他信息都显示（人口、面积、website，resident信息）


3. Council 详情页（/councils/[slug]）
改动最大的页面：

VIC：完全不变，保留现有所有 tabs
其他州：简化版布局
基本信息（人口、面积、网站）
一个醒目的 "Visit Library Events →" 卡片，点击新 tab 跳到 libraryUrl
Census 人口统计图表（数据从 ABS 拿，和 VIC 一样）
不显示 Events / Libraries / New Resident 等 tabs（数据不存在）
4. Events 页（/events）
加 State 筛选，默认显示 VIC
其他州没有爬虫数据，筛到 NSW 时显示一个提示卡片：
"NSW 活动数据暂未收录，请直接访问各 council 图书馆网站"

下面列出 NSW council 列表 + 各自的 libraryUrl 链接


5. Libraries 页（/libraries）
类似 Events 页，加 State 筛选
其他州也需要有详细图书馆数据，同样显示提示 + council 链接列表，只是没有events数据，
或者考虑：其他州的图书馆只存一条"总馆"记录（只有网址），也能在地图上显示一个点


6. AI Search 页（/search）
基本不用改——Claude 的 web search 本来就能搜全澳，只是数据库匹配结果只会返回 VIC 的内容，其他州靠 web search 补充，现在已经是这样了。


------
New South Wales

Sydney	8.2M	800,642 km²	20	20	
Councils →
Libraries →
🏙️	
Victoria

Melbourne	6.7M	227,444 km²	34	173	

悉尼的这个图书馆肯定是比 Melbourne 多的，所以你这个 part 是不对的，没有“全图书馆”这个。 

3. 澳洲各州 Council 数量

澳洲目前约有 546 个 Local Government Areas (LGA)。

州/领地	Council 数量
NSW	128
VIC	79
QLD	77
WA	137
SA	68
TAS	29
ACT	0（ACT Government）
NT	17

总计约：

535–550 之间（根据统计口径略有差异）。

4. 澳洲各州概览
州	人口	面积 km²	Council
NSW	850万	809,000	128
VIC	700万	228,000	79
QLD	560万	1,853,000	77
WA	300万	2,646,000	137
SA	190万	983,000	68
TAS	58万	68,000	29
ACT	47万	2,358	0
NT	25万	1,349,000	17

---
8. 对新移民最重要的数据

如果我是新移民，我会优先看：

排名	数据
1	人口
2	华人比例
3	房租
4	房价
5	学校评分
6	火车站
7	Library
8	Council 活动
9	儿童活动
10	医院
11	犯罪率
12	就业机会
9. 如果是你的 Council Explorer

我建议首页不要放教堂。

而是放：

模块	价值
Council	⭐⭐⭐⭐⭐
Library	⭐⭐⭐⭐⭐
Events	⭐⭐⭐⭐⭐
Playground	⭐⭐⭐⭐
Maternal Health	⭐⭐⭐⭐
Childcare	⭐⭐⭐⭐
Community Centre	⭐⭐⭐⭐
Public Transport	⭐⭐⭐⭐
School	⭐⭐⭐⭐⭐
Hospital	⭐⭐⭐⭐

---


🧠 Australia Liveability Data Platform — TCA

目标：构建一个面向新移民 / 家庭用户的 Location Intelligence Platform（生活便利度地图）

核心数据维度：

🏥 Hospital
👶 Childcare
🛝 Playground
🚆 Public Transport（Train/Tram/Bus/Stop Density）
🧭 Transit Accessibility Score（衍生指标）
1. 🏥 Hospital（医院）
📦 数据来源
✅ National Health Services Directory (NHSD)
来源：Australian Government / Healthdirect
类型：开放 GIS + API + 数据下载
链接：data.gov.au & healthdirect
📊 数据类型
hospital
--------
id
name
type (public/private/emergency/clinic)
address
lat
lng
phone
website
emergency_available
state
💡 为什么值得做
全国统一标准（最稳定数据源之一）
对新移民最重要（急诊 / GP）
可做 “10 min hospital access score”
🎯 展示方式
Map（医院点位）
10min driving radius heatmap
“Nearest hospital” card
Emergency vs Non-emergency filter
⚙️ 难度

⭐⭐⭐（中等偏易）

数据结构统一
主要工作是 cleaning + geocode
2. 👶 Childcare（托儿所）
📦 数据来源（核心）
✅ ACECQA National Registers
全国统一官方数据库
CSV 可导出
每日更新
来源：https://www.acecqa.gov.au
✅ StartingBlocks（增强数据）
fees（费用）
vacancy（空位）
rating（质量评级）
📊 数据类型
childcare
---------
id
service_name
provider
service_type (Long Day Care / Family Day Care)
address
lat
lng
suburb
postcode

quality_rating (Exceeding / Meeting / etc)
fees_per_day
vacancy_status
opening_hours
💡 为什么值得做
🇦🇺 家庭刚需第一数据（尤其有孩子）
决策影响极大（搬家 / 房租）
可以直接商业化
🎯 展示方式
“Childcare availability heatmap”
“Quality ranking per suburb”
“Price range per day”
“Nearest 5 childcare centers”
⚙️ 难度

⭐⭐（低）

官方 API + CSV
数据质量高、结构统一
3. 🛝 Playground（游乐场）
📦 数据来源
✅ OpenStreetMap (OSM)
tag: leisure=playground
全国覆盖
可通过 Overpass API
✅ Local Council Open Data
VIC Data Portal（部分 council 提供 GeoJSON）
📊 数据类型
playground
----------
id
name
lat
lng
suburb
council
fenced (optional)
shade (optional)
bbq (optional)
toilet_nearby (optional)
surface_type
💡 为什么值得做
对家庭用户极高价值（尤其你 target 的人群）
可以做 “walkability for kids”
可扩展为 lifestyle score
🎯 展示方式
Map view（儿童设施密度）
“Playground within 500m radius”
Filter:
shaded
fenced
BBQ nearby
“Kid-friendly suburb score”
⚙️ 难度

⭐⭐（低）

OSM 非常成熟
无需注册 API key
4. 🚆 Public Transport（公共交通）
📦 数据来源
✅ GTFS（全球标准）

每个州都有：

State	Provider
VIC	PTV (data.vic.gov.au)
NSW	TfNSW
QLD	Translink
WA	Transperth
SA	Adelaide Metro

参考标准：GTFS Static + GTFS RT

📊 数据类型
transit_stop
------------
stop_id
name
lat
lng
type (bus/train/tram/ferry)

transit_route
------------
route_id
type
agency

stop_times
----------
stop_id
route_id
arrival_time
💡 为什么值得做
决定房价 / 租房选择核心因素
可做 suburb ranking
数据可以计算 “Transit Score”

类似：

Transit Score 0–100 =
weighted(
  train_stations,
  bus_density,
  frequency,
  walking_distance
)
🎯 展示方式
“Transit Score per suburb”
Map heatmap（交通覆盖）
Nearest station card
commute time estimation（可后期加）
⚙️ 难度

⭐⭐⭐（中等）

数据统一（GTFS）
但处理逻辑复杂（路线 + 时间）
5. 🧭 核心衍生指标（非常关键）

你这个项目真正的价值不在数据，而在：

⭐ Liveability Score（生活便利度）

建议你做：

Liveability Score =
0.25 Childcare
0.20 Transit
0.20 Hospital
0.20 Playground
0.15 Density / Population / Safety (future)
6. 🧱 系统架构建议（结合你技术栈）

你现在的栈（Neon + Render + Vercel）很适合：

Backend
Node.js / Python ingestion jobs
Cron sync:
daily:
  - ACECQA childcare sync
  - NHSD hospital sync
weekly:
  - OSM playground update
monthly:
  - GTFS refresh
Database (Neon Postgres)
suburb
council
hospital
childcare
playground
transit_stop
transit_score
Frontend (Vercel)
Map-based UI（Mapbox / Google Maps）
Suburb profile page
“near me” search
7. 📊 总体难度评估
模块	数据难度	清洗难度	产品价值
Hospital	⭐⭐⭐	⭐⭐	⭐⭐⭐⭐
Childcare	⭐⭐	⭐⭐	⭐⭐⭐⭐⭐
Playground	⭐⭐	⭐⭐	⭐⭐⭐⭐⭐
Public Transport	⭐⭐⭐	⭐⭐⭐⭐	⭐⭐⭐⭐⭐



------
📊 四个模块的真实难度重评
👶 Childcare — 建议第一个做
实际难度：⭐⭐（最低）

ACECQA 的 CSV 可以直接下载，字段完整
数据质量高，已有 lat/lng（或可 geocode）
对你目标用户（新移民家庭）价值最高
可以在 1-2 天内跑通 MVP
建议立即开始的原因： StartingBlocks 有 vacancy + fees 数据，这是真正的差异化——别的地图平台没有。

🏥 Hospital — 建议第二个做
实际难度：⭐⭐⭐（中等，但有坑）

NHSD API 需要申请 key，审批可能需要几天
数据有重复（同一家医院多条记录）
替代方案：先用 OSM (amenity=hospital) 快速起步，NHSD 后期替换
注意： "10 min hospital access score" 需要 routing API（Mapbox Directions 或 OSRM），会有额外费用。

🛝 Playground — 最简单，做锦上添花
实际难度：⭐（比你估计还低）


# Overpass API 一行搞定全国数据
[out:json];
area["ISO3166-1"="AU"]->.au;
node["leisure"="playground"](area.au);
out body;
全国数据一次性下完，定期刷新即可。但单独看价值一般，要和其他数据叠加才有意义。

🚆 Public Transport — 最复杂，暂缓
实际难度：⭐⭐⭐⭐⭐（比你估计高很多）

几个真实问题：

问题	具体情况
GTFS 文件很大	VIC 的 GTFS zip 解压后 500MB+
频率计算复杂	要解析 stop_times.txt 才能算"每小时几班"
各州格式略有差异	需要逐州处理
Transit Score 本身就是研究课题	Walk Score 公司有专利算法
建议： 先用 stop 密度做近似（每平方公里多少个站），别一开始就算频率。

🎯 我的建议：分三期
第一期（1-2 周）— 能看到效果的 MVP

Childcare 全国数据
  ↓
suburb profile 页面
  ↓
"附近5个托儿所 + 评级 + 费用"
  ↓
地图热力图（childcare 密度）
这一期能产生真实用户价值，也最容易验证需求。

第二期（3-4 周）— 差异化核心

Hospital（先用 OSM）
Playground（Overpass API）
  ↓
Suburb Liveability Score（3个维度先）
  ↓
suburb 对比页面
  ↓
"X suburb vs Y suburb"
这时候产品有了真正的 intelligence，而不只是数据展示。

第三期（1-2 个月）— 护城河

Transit Score（GTFS，只做 VIC 先）
  ↓
Claude AI 分析（"解释为什么 Clayton 评分高"）
  ↓
Liveability Score 完整版（5个维度）
⚠️ 一个关键建议
Liveability Score 是你的护城河，不是数据本身。

数据都是公开的，任何人都能爬 ACECQA。但你的算法权重、呈现方式、面向新移民的解读角度——这些才是差异化。

建议在第一期就确定好评分框架，哪怕权重先随便定，后期可以调整。

下一步
要开始做的话，建议先回答：

在现有项目扩展，还是新建？（影响数据库设计）
先只做 VIC，还是全国？（影响数据量和工作量）
Childcare 先开始？（我认为是最明智的起点）

----