# Superpowers Skill Notes for Council Explorer

> 目的：记录 `using-superpowers` 这类 skill 对本项目的实际价值，避免把它的强约束口吻直接照搬到 Codex 工作流里。

## 1. 对当前项目 council 的落地建议

### 当前阶段优先顺序

1. source mapping
2. schema adjustment
3. generic crawler framework
4. API routes
5. front-end pages

### 需要补强的内容

- source registry JSON
- event category taxonomy
- pagination adapters
- library network mapping

## 2. 总结

`using-superpowers` 对你最大的价值是提醒你：

- 先想清楚怎么做
- 再选择正确工具
- 最后再写代码

对这个项目来说，真正重要的是把它落成：

- 可重复的 source workflow
- 稳定的 event taxonomy
- 可扩展的 crawler 结构
- 清晰的前端展示规则

## 3. council 项目哪些适合做？

按 using-superpowers 的思路看，这次最重要的结论不是“先写哪个代码”，而是先把来源和分类规则定稳，再进实现。

我建议你基于这三份文档先走这条线：

### 3.1 先修正一个关键前提

`council-prd.md` 和 `council-ticket.md` 里现在把 Eventbrite / Humanitix / mylibrary.digital 写得太像“完整来源”了。

但 `council-audit-codex.md` 已经说明：很多 council 是 `official listing + booking source` 的混合模式。

所以如果直接做 T05 Eventbrite API，会把“报名平台”误当成“完整活动目录”。

### 3.2 我建议的实际执行顺序

1. `T00`
2. `T01`
3. `T02`
4. 在 `T04/T05` 之前，先补一个 `source registry / audit mapping` 步骤
5. 再做 `T07/T08` API
6. 再做 `T04/T05` 爬虫
7. 最后做 `T09-T13` 页面

### 3.3 你现在最该加的不是新页面，而是新数据约束

建议在 schema 和 source 配置里补这些字段：

- `listingSource`
- `bookingSource`
- `sourcePageUrl`
- `paginationStrategy`
- `libraryNetwork`
- `sourceConfidence`

理由很简单：

- 你现在已经知道 Canada Bay、Maribyrnong 这类站点有分页且官方目录不止一个入口
- 如果不保留 `sourcePageUrl`，以后排错很难
- 如果不区分 listing 和 booking，前端会误导用户

### 3.4 对 ticket 的具体建议

- `T04` 不要只定义成 “mylibrary.digital 通用爬虫”
  - 应该升级成 “通用 source crawler framework + source-specific adapters”
- `T05` 不要只写 “Eventbrite API 接入”
  - 应该改成 “Eventbrite as one source type, not the source truth”

### 3.5 按 using-superpowers 的流程意识，这里更适合先做的 skill / 工作方式

- 先做 process：source audit、schema design、pagination strategy
- 再做 implementation：crawler、API、UI

也就是说，这个项目现在最需要的是“规则和数据模型先稳”，不是立刻堆代码。

### 3.6 直白结论

现在最值得先做的是：`source mapping + schema 调整`。

不建议直接进入 Eventbrite / Humanitix 爬虫实现。

PRD 和 ticket 不是错，但它们需要基于 audit 结果做一次口径收敛。

如果你愿意，我下一步可以直接帮你整理一版：

- `T04/T05` 的重定义建议
- `schema.prisma` 该加哪些字段
- `source registry` 的 JSON 模板

## 4. superpower 已保存到

```text
/Users/sha/Code/AI-code-26/10-australia-council-explorer/ask-skills-codex-cli.md
```

### 关于安装范围

- `superpowers` 现在是全局用户级安装/启用的，不是只装在某个项目里。
- 依据是你的 `~/.codex/config.toml` 里启用了 `superpowers@openai-curated`。
- 这份 md 文件本身是项目内文件，只放在这个目录下，方便你在这个项目里直接用。

## 5. Superpowers 使用模板

下面这些提示词可以直接复制到 Codex CLI 里用。目标是让 Superpowers 自动介入，先做需求澄清、方案设计、计划拆解，再进入实现。

### 5.1 先梳理需求

```text
先不要写代码。

请先帮我梳理这个需求，输出：
1. 你理解的目标
2. 关键约束
3. 需要我确认的问题
4. 可能的实现路径

等我确认后再继续。
```

### 5.2 先出设计方案

```text
先做设计，不要直接改代码。

请基于当前仓库和需求，输出一个可执行方案：
1. 现状分析
2. 推荐方案
3. 备选方案
4. 风险和取舍
5. 最终建议

请写得适合我直接审阅。
```

### 5.3 先写计划

```text
先不要动手实现。

请把这件事拆成一个清晰的 implementation plan：
1. 按依赖顺序拆步骤
2. 每步都写清文件路径和要改什么
3. 每步都包含验证方式
4. 优先最小改动

等我确认计划后再开始。
```

### 5.4 开始执行

```text
计划我确认了。

请按计划执行，优先使用：
- 小步提交思路
- TDD / 先验证再扩展
- 必要时用 subagent 分工

每完成一个阶段都先汇报结果，再继续下一步。
```

### 5.5 做前端 / UI 设计

```text
这是一个前端 / UI 任务。

请先从设计角度帮我看：
1. 视觉层级
2. 间距和布局
3. 信息密度
4. 文案是否清晰
5. 哪些地方适合先做低风险优化

先给出设计建议，不要急着改代码。
```

### 5.6 修 bug

```text
这是一个 bug 修复任务。

请先定位根因，再修复：
1. 复现路径
2. 可能的根因
3. 你会先检查哪些文件
4. 最小修复方案
5. 如何验证修复有效

不要顺手重构无关部分。
```

### 5.7 需要你直接接管流程时

```text
请按 superpowers 的方式处理这件事：
- 先澄清需求
- 再出方案
- 再写计划
- 再执行
- 每一步先确认再推进

如果适用，请优先使用 brainstorming、writing-plans、test-driven-development、subagent-driven-development。
```

### 5.8 适合长期固定使用的一句

```text
先别写代码，先按 superpowers 的流程来：澄清需求 → 出方案 → 拆计划 → 再执行。
```

## 6. GitHub superpower 安装

- <https://github.com/obra/superpowers>

### Claude Code

Superpowers is available via the official Claude plugin marketplace.

#### Official Marketplace

Install the plugin from Anthropic's official marketplace:

```text
/plugin install superpowers@claude-plugins-official
```

#### Superpowers Marketplace

The Superpowers marketplace provides Superpowers and some other related plugins for Claude Code.

Register the marketplace:

```text
/plugin marketplace add obra/superpowers-marketplace
```

Install the plugin from this marketplace:

```text
/plugin install superpowers@superpowers-marketplace
```

### Codex CLI

Superpowers is available via the official Codex plugin marketplace.

Open the plugin search interface:

/plugins
Search for Superpowers:

superpowers
Select Install Plugin.

Codex App
Superpowers is available via the official Codex plugin marketplace.

In the Codex app, click on Plugins in the sidebar.
You should see Superpowers in the Coding section.
Click the + next to Superpowers and follow the prompts.
Factory Droid
Register the marketplace:

droid plugin marketplace add https://github.com/obra/superpowers
Install the plugin:

droid plugin install superpowers@superpowers
Gemini CLI
Install the extension:

gemini extensions install https://github.com/obra/superpowers
Update later:

gemini extensions update superpowers
OpenCode
OpenCode uses its own plugin install; install Superpowers separately even if you already use it in another harness.

Tell OpenCode:

Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
Detailed docs: docs/README.opencode.md

Cursor
In Cursor Agent chat, install from marketplace:

/add-plugin superpowers
Or search for "superpowers" in the plugin marketplace.

GitHub Copilot CLI
Register the marketplace:

copilot plugin marketplace add obra/superpowers-marketplace
Install the plugin:

copilot plugin install superpowers@superpowers-marketplace
