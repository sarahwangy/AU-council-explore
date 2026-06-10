
# 1.

[council-prd.md](docs/council-prd.md) [council-ticket.md](docs/council-ticket.md) [city-council-扩展.md](docs/city-council-扩展.md) 读取这几个file，给我你的建议。分析下从哪个ticket开始。如果开始写代码的话，是不是需要安装一些skills ，有哪些好用的skills可以在codex 里面安装吗

# 2.
有一些Eventbrite 并没有显示全部的events，你需要check下是否每个图书馆都爬对了正确的网站。比如 https://www.canadabay.nsw.gov.au/whats-on?page=17
https://www.canadabay.nsw.gov.au/libraries/library-services
显示很多events，但是Eventbrite  只有一个 https://www.eventbrite.com.au/o/city-of-canada-bay-libraries-8858155053

所以你需要全部确认下其他的library 是不是包含了全部的events


# 3. 
好的，给你整理一份 council -> 真实活动来源 的审计表，如果有分页，比如https://www.maribyrnong.vic.gov.au/library/Whats-On/Events?dlv_OC%20CL%20Libraries%20Events%20Listing=(pageindex=2) 有的分页，很多，这种如何处理。不需要改我们之前的文件，只需要生成一个新的file保存，名字叫council-audit-codex.md 如果handle这么多的library events，他们本身就有分页，如果全部集中到我自己的website 之后，如何处理这么多的page events呢，差不多有一百个library，events会很多，前端大概如何做展示呢。给些你的建议。


# 5
如果我想做个功能，就是用户选择几个他们喜欢的council library在一起，然后只显示他们favorite的library events，或者booking的event，这个需要怎么做，给建议给我。写到新文件 council-ask-feature-codex.md


# 6
还有哪些feature 可以添加到这个项目吗，这个项目有竞争力吗，用户觉得有价值吗


# 7。
把你的答案更新到 [council-ask-feature-codex.md](docs/council-ask-feature-codex.md) 里面最后部分。另外Multilingual UI
简体中文先做
后面可以加越南语、印地语
这是很适合澳洲社区场景的增强项 做起来难吗。
如果更新不准，用户信任会掉得很快 这个解决办法是什么，如果爬虫太多，可以直接放个原来original的图书馆link URL 在那里，他们自己去点，可以吗




# 8.
[composiohq/awesome-codex-skills](https://github.com/composiohq/awesome-codex-skills) 这个skills需要装吗，如何用。
有哪些好用的codex 里写代码写项目的设计的好用的skills，antropic 的superpower 可以在codex 里面可以用吗。
这个可以吗

$ npx skills add https://github.com/anthropics/skills --skill claude-api   
另外anthropics 有个frontend design skills ，可以在codex 里面装吗，codex 有自己的frontend design 设计UI 的吗，推荐几个codex 自己的skills，必要的。或者angent


# 10.
什么是regional network 多，workshops 是什么，分别有那些。craft 呢，heritage 是什么，有哪些。youth programs呢。

把你的答案保存到 [council-共同-不同-codex.md](docs/council-共同-不同-codex.md) 后面，另外做个我下一步可以直接帮你做一个表：

category -> definition -> examples -> filter label 也保存在最后面


# 11.
还有需要统计哪些有maker	maker / DIY / 创客类活动	maker space, 3D printing, sewing club	Maker，保存到 最后面