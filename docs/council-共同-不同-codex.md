# Council Events Common vs Different

> 目的：按城市总结各 council / library events 的共同点，并单独标出不同城市里的特殊平台、特殊 library network、特殊事件来源。
>
> 说明：这是基于当前项目文档的产品级整理，不是逐站点的最终抓取审计表。

## 1) 按城市整理：共同的 events 是什么

| 城市 | 共同 events 类型 | 典型特征 |
|---|---|---|
| Sydney | Storytime / baby rhyme / preschool、school holiday programs、English / conversation classes、tech help、book clubs、author talks、youth / seniors / multicultural programs | 平台最碎，Eventbrite、Humanitix、custom、official listing 并存。|
| Melbourne | Storytime / baby rhymetime / toddler / preschool、English conversation、tech help、book clubs、school holiday programs、local history、wellbeing、youth programs、multicultural programs | 事件密度高，regional network 多，平台混合最明显。|
| Brisbane | Storytime、school holiday programs、workshops / craft、family / children programs、digital / tech help、community learning | 自定义站点较多，但 mylibrary.digital 也能覆盖一部分。|
| Adelaide | Storytime、school holiday programs、workshops、author talks、multicultural events、adult learning、community programs | 底层平台多样，但活动类型非常“图书馆化”。|
| Perth | Storytime、school holiday programs、workshops / craft、tech help、health / wellbeing、seniors、community learning、multicultural programs | 自定义站多，Humanitix / Eventbrite 也很常见。|
| Geelong | Storytime、community / family programs、special events | 目前是单一新平台（Communico）场景，结构更统一。|
| Ballarat | Storytime、family / children programs、workshops | 规模小，但活动类型和大城市高度相似。|
| Bendigo | Storytime、community events、workshops、adult / family programs | 规模小，平台简单，适合快速接入。|

## 2) 全澳洲 council events 的共同点是什么

| 共同 events 类型 | 用户通常会看到什么 | 为什么是共通项 |
|---|---|---|
| Storytime / Baby Rhymetime / Toddler Time | 面向 0-5 岁儿童和家长的固定重复活动 | 几乎所有公共图书馆都把 early literacy 作为核心服务。|
| School holiday programs | School holiday 期间的儿童活动、craft、games、STEM、reading | 这是图书馆最稳定的流量入口之一。|
| Book clubs / reading groups | Book club、reading group、literary discussion | 各地都需要 low-cost 的社区聚集活动。|
| Author talks / talks & interest groups | 作家分享、专题讲座、社区谈话 | 图书馆天然承载文化活动。|
| English / conversation classes | English conversation、conversation circle、language support | 对新移民和多元文化社区特别常见。|
| Tech help / digital literacy | 手机、电脑、iPad、email、online forms、AI 基础 | 图书馆在做数字包容。|
| Workshops / craft / maker programs | 手工、编程、DIY、maker、sewing、gardening | 低门槛、可重复、适合全年龄。|
| Seniors programs | 社交、健康、阅读、数字帮助 | 老年用户是 library 的稳定主力群体。|
| Youth programs | Teen space、homework support、HSC/study help | 青少年学习支持是图书馆常见职能。|
| Local history / heritage | 家谱、local studies、archives、history talks | 大多数 council 都有本地记忆和研究需求。|
| Health / wellbeing | 养生、心理健康、社交连接、support groups | 图书馆越来越像社区第三空间。|
| Multicultural programs | 中文/越南语/双语活动、多元文化节 | 澳洲本地的社区属性决定了它几乎必然存在。|

## 3) 各城市里“特殊的”地方

| 城市 | Council / Library 名称 | 特殊点 |
|---|---|---|
| Sydney | City of Canada Bay Libraries | 官方 `What's On` 才是主活动目录，Eventbrite 只是其中一个入口，不能当完整源。|
| Sydney | Fairfield City Open Libraries | `mylibrary.digital`，可直接复用通用平台爬虫。|
| Sydney | Liverpool City Library / Northern Beaches Library Service / Penrith City Libraries / Randwick City Library | Humanitix 作为主要 booking 平台。|
| Sydney | Blacktown / City of Sydney / Campbelltown / Canterbury-Bankstown / Hills Shire 等 | Eventbrite 活动很多，但常常需要和官方目录交叉核对。|
| Sydney | Ku-ring-gai / Waverley / Willoughby / Ryde / Woollahra | 以自定义站为主，通常需要单独写爬虫。|
| Melbourne | Yarra Plenty Regional Library（Banyule / Nillumbik / Whittlesea） | 三个 council 共享同一套 regional library events。|
| Melbourne | Whitehorse Manningham Libraries（Whitehorse / Manningham） | 共用 library service，事件系统要按共享网络处理。|
| Melbourne | Your Library（Knox / Maroondah / Yarra Ranges） | 区域共享平台，适合一套通用抓取。|
| Melbourne | myli.org.au（Casey / Cardinia / Greater Dandenong） | 外围区共享体系，和单一 council 不是一对一关系。|
| Melbourne | Port Phillip / Stonnington / Hobsons Bay / Frankston / Maribyrnong / Darebin / Merri-bek / Brimbank / Yarra | 官方目录 + 第三方报名平台并存，不能把 Eventbrite 当成全部。|
| Brisbane | Brisbane City Libraries | 自定义站点，偏 SirsiDynix，需要单独研究。|
| Brisbane | Moreton Bay Libraries / Logan Libraries / Scenic Rim Libraries | `mylibrary.digital`，可复用通用平台。|
| Brisbane | Redland City Council Libraries | Eventbrite。|
| Adelaide | Adelaide City Libraries | Humanitix。|
| Adelaide | Marion / Mitcham / Onkaparinga / Salisbury / Tea Tree Gully / Walkerville | Eventbrite 为主，但要注意是否只是 booking。|
| Adelaide | Charles Sturt / Holdfast Bay / Mount Barker / Playford / Prospect / Unley / Victor Harbor / West Torrens | 自定义站为主，需要逐个处理。|
| Perth | Cockburn Libraries / Vincent Library | `mylibrary.digital`。|
| Perth | Armadale / Fremantle / Serpentine-Jarrahdale / South Perth / Stirling / Swan | Humanitix。|
| Perth | Canning / Gosnells / Kwinana / Melville / Rockingham | Eventbrite。|
| Perth | The Grove Library（Cottesloe / Mosman Park / Peppermint Grove） | 共享同一个 library network，不是三个独立来源。|
| Perth | Joondalup / Bayswater / Cambridge / Kalamunda / Mundaring / Murray / Nedlands / Subiaco / Victoria Park / Wanneroo 等 | 多为自定义站点，常见于本地化页面。|
| Geelong | Geelong Regional Libraries (GRLC) | Communico，新平台，需单独研究 API/HTML。|
| Ballarat | Ballarat Libraries | Humanitix，接入成本很低。|
| Bendigo | Goldfields Library Corporation | Eventbrite，接入成本很低。|

## 4) 城市级别的产品判断

| 城市 | 适合优先做什么 | 原因 |
|---|---|---|
| Melbourne | 先做统一聚合、收藏、对比、地图 | 数据量大，用户需求最明确，最适合作为主版本。|
| Sydney | 先做 source audit，再做优先级抓取 | 平台碎，官方/第三方混合严重。|
| Brisbane | 先做 Brisbane BCC，再复用 mylibrary.digital | 最大 council 影响力强，值得优先。|
| Adelaide | 先做 Eventbrite + Humanitix 通用方案 | 平台相对集中，迁移成本低。|
| Perth | 先覆盖 Humanitix / Eventbrite / mylibrary.digital | 可快速拿到较高覆盖率。|
| Geelong | 先研究 Communico | 这是新的可复用平台点。|
| Ballarat / Bendigo | 最适合做“快速胜利” | 平台简单，能快速扩展 coverage。|

## 5) 最终可复用的结论

1. 全澳洲 council events 的共同底层，不是某个平台，而是同一组活动类型。
2. 大部分城市都离不开：
   - storytime
   - school holiday programs
   - workshops
   - tech help
   - book clubs
   - author talks
   - English / conversation classes
   - seniors / youth programs
3. 真正的差异不在 events 本身，而在：
   - 事件来源平台
   - 是否共享 regional library network
   - 是否官方目录 + booking platform 混合
   - 是否分页很多、结构复杂
4. 所以产品层面要把：
   - `event type`
   - `source platform`
   - `library network`
   - `council`
   分开建模。

## 6) 术语补充说明

### Regional network 是什么

`regional network` 指的是**多个 council 共用同一套 library service / 活动系统**，不是每个 council 独立维护一套完全分开的图书馆活动体系。

常见例子：

- `YPRL`
  - `Banyule`
  - `Nillumbik`
  - `Whittlesea`
- `Whitehorse Manningham Libraries`
  - `Whitehorse`
  - `Manningham`
- `Your Library`
  - `Knox`
  - `Maroondah`
  - `Yarra Ranges`
- `myli.org.au`
  - `Casey`
  - `Cardinia`
  - `Greater Dandenong`

这类网络的影响是：

- 活动来源不一定是一对一 council
- 一个活动页可能覆盖多个 council
- 抓取时要把 `library network` 单独建模

### Workshops 是什么

`workshops` 是**参与式、动手型、通常有引导者或讲师**的活动。

常见内容：

- digital / tech help
- English class
- writing workshop
- art workshop
- maker / DIY
- gardening
- sustainability
- financial literacy

在 library 场景里，workshop 往往比 talk 更“有操作性”，用户通常会实际参与练习。

### Craft 是什么

`craft` 是**手工制作类**活动，通常比 workshop 更偏“做作品”。

常见内容：

- card making
- paper craft
- origami
- knitting / crochet
- sewing
- collage
- recycled craft
- holiday craft

它经常和这些标签一起出现：

- `Children`
- `Family`
- `School holidays`
- `Art`
- `Maker`

### Heritage 是什么

`heritage` 是**历史、地方记忆、文化遗产**相关活动。

常见内容：

- local history
- family history / genealogy
- archives
- historical talks
- heritage walk
- oral history
- old photos / maps / documents

这类活动通常对应：

- local studies
- history collections
- archive rooms
- heritage exhibitions

### Youth programs 是什么

`youth programs` 是**面向青少年 / young people** 的活动，通常不是给小朋友，而是给 teens。

常见内容：

- homework support
- study help
- HSC / exam support
- teen reading group
- coding / digital literacy
- gaming / esports
- resume / career workshop
- wellbeing / social connection

### 这些分类怎么用在项目里

建议你把活动拆成两层：

- 第一层大类：
  - `children`
  - `youth`
  - `adult`
  - `seniors`
  - `family`
  - `multicultural`
  - `heritage`
  - `wellbeing`
  - `learning`
  - `technology`
- 第二层细类：
  - `storytime`
  - `workshop`
  - `craft`
  - `book club`
  - `tech help`
  - `english class`
  - `heritage talk`
  - `school holiday program`

这样前端筛选和数据库建模都会更清晰。

## 7) `category -> definition -> examples -> filter label`

| category | definition | examples | filter label |
|---|---|---|---|
| storytime | 面向幼儿和家长的固定阅读/讲故事活动 | Baby Rhymetime, Toddler Time, Preschool Storytime | `Storytime` |
| school holiday program | School holiday 期间的儿童活动 | holiday craft, holiday reading, holiday STEM | `School Holidays` |
| book club | 读书讨论、书友会、阅读小组 | book club, reading group, literary discussion | `Book Clubs` |
| author talk | 作家分享、读书讲座、主题 talk | author talk, writers talk, literature talk | `Author Talks` |
| workshop | 参与式、动手型、带讲师引导的课程 | digital workshop, writing workshop, gardening workshop | `Workshops` |
| craft | 手工制作活动 | card making, paper craft, knitting, crochet | `Craft` |
| tech help | 数字技能和设备使用帮助 | iPad help, computer help, email help, AI basics | `Tech Help` |
| english class | 英语学习、口语练习、conversation circle | English class, conversation club, ESL support | `English` |
| youth program | 青少年活动和学习支持 | teen space, homework help, HSC study help | `Youth` |
| seniors program | 面向老年用户的社交、学习、健康活动 | seniors social group, digital help for seniors | `Seniors` |
| heritage | 本地历史、家谱、档案、遗产相关活动 | family history, archives talk, heritage walk | `Heritage` |
| wellbeing | 心理健康、社交连接、健康支持 | wellbeing talk, support group, mindfulness | `Wellbeing` |
| multicultural | 多语言、多文化、社区融合活动 | bilingual storytime, Chinese class, multicultural festival | `Multicultural` |
| learning | 一般学习和技能提升活动 | study session, library skills, financial literacy | `Learning` |
| maker | maker / DIY / 创客类活动 | maker space, 3D printing, sewing club | `Maker` |

## 8) Maker 活动 / 设施统计

### 需要统计什么

`maker` 不是单一活动名，它通常包括：

- maker space
- 3D printing
- sewing / stitching
- laser cutter
- electronics / soldering
- repair / create / build
- DIY / tinkering
- craft lab / creative lab
- maker workshop

### 已确认有 Maker 相关活动或设施的案例

| 城市 | Council | Library / Service 名称 | 典型 maker 形式 | 说明 |
|---|---|---|---|---|
| Sydney | City of Canada Bay | City of Canada Bay Libraries / The Learning Space | Open Maker、Open Maker Workshops、3D printing、laser cutter、electronics | 官方有独立 Open Maker 项目和工作坊。 |
| Melbourne | City of Melbourne | Library at The Dock / Makerspace | 3D printing、extruder、recycling / making workshops | 城市级 library makerspace，偏公共创客空间。 |
| Melbourne | Hobsons Bay | Hobsons Bay Libraries | Monday Makers、sewing machines、Cricut、3D pens、repair kits | 明确是面向公众的 maker 活动。 |
| Melbourne | Maribyrnong | Maribyrnong Libraries | Maker Space、creative technology、Library of Things | 既有 maker space，也有创意科技和可借物品系统。 |
| Melbourne | Ballarat | Ballarat Libraries | Maker Space、3D printers、vinyl cutter、heat press、sewing machines | 官方明确列出 Maker Space 设备。 |
| Brisbane | Brisbane City Council | Brisbane City Libraries | makerspace / maker programs | 文档和 council 资料里明确提到 makerspace。 |
| Adelaide | City of Adelaide | Adelaide City Libraries | Innovation and Media Lab、Library of Things、makerspace-style equipment | 有创新媒体实验室和馆内创作设备。 |
| Bendigo | City of Greater Bendigo / Goldfields Library Corporation | Bendigo library service | makerspace concept / open-ended making space | 以 makerspace 概念出现，适合后续再核对具体项目页。 |

### Maker 相关内容的产品用法

如果你要把 Maker 做成筛选器或统计项，建议分成两层：

1. `maker` 作为大类
   - 只要是创客、DIY、动手、创意科技就进这个类
2. `maker subtype` 作为细类
   - `3D printing`
   - `sewing`
   - `electronics`
   - `repair`
   - `laser cutting`
   - `creative tech`

### 建议的展示方式

- 在 council 页显示：
  - `Maker programs`
  - `Makerspace available`
  - `Creative technology`
- 在 event card 上显示：
  - `Maker`
  - `DIY`
  - `Creative Tech`
  - `Repair`

### 备注

Maker 活动和 workshop 有交集，但不完全等价。

- `workshop` 是活动形式
- `maker` 是活动主题 / 场景 / 设施类型

所以建议你同时保留：

- `event format`
- `event topic`
- `facility type`

这样以后统计会更准。


Sewing 和 stitching 在中文里都与“缝纫”有关，但侧重点不同。Sewing（缝纫、做针线活）含义：指利用针和线制作或缝制衣物的整个过程。它可以指广义的手工缝制或机器缝纫。重点：强调创造或制作一件完整的物品（如做衣服、缝补破洞）。常见搭配：sewing machine（缝纫机）、sewing kit（缝纫工具包）。Stitching（缝制、缝合、针脚）含义：指具体的缝纫动作或缝出来的痕迹（针脚/线迹）。重点：强调穿针引线的具体手法、针法、缝线的效果，或者两块布料连接在一起的具体缝合处。常见搭配：cross-stitching（十字绣）、neat stitching（整齐的针脚）。
Sewing 是制作成衣的过程，而 stitching 是你下针、缝合时留下的具体针脚或动作。你可以用缝纫机进行缝纫（sewing），在这个过程中你会缝出好看的线迹（stitching）


Soldering（焊接/焊锡）是指利用熔点较低的金属（焊料）熔化后，将不同的金属工件或电子元件连接在一起的加工工艺。此过程不熔化母材，主要用于实现电路的电气导通与机械固定。