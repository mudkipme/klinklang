这是神奇宝贝百科的工具台和机器人程序，工具台可以进行名词转换、层叠样式表转换等便于编辑神奇宝贝百科的操作；机器人（MudkipRadar）可以进行神奇宝贝百科中多项自动化操作。

[神奇宝贝百科](http://wiki.52poke.com/)是一部协作共建的，关于神奇宝贝（Pokémon）的在线百科全书。

本项目程序基于 MIT 协议，其中神奇宝贝专有词汇的版权和商标权属于神奇宝贝相关企业。

"database/veekun" 文件夹下数据来自 [veekun/pokedex](https://github.com/veekun/pokedex) 项目，特此感谢。

**Pokémon © 2002-2013 Pokémon. © 1995-2013 Nintendo/Creatures Inc./GAME FREAK inc.**

## 使用方法

1. 安装 Node.js，Ruby，Bower 和 SASS。
2. 分别使用 `npm install` 和 `bower install` 安装依赖的组件。
3. 使用 `node radar init` 和 `node radar init-translation` 初始化数据库。

### 工具台

本程序安装后，可以进入所在目录，使用 `node app` 启动工具台。

### 机器人

1. `node radar login <username> <password>` 使用机器人的用户名和密码登录到神奇宝贝百科。
2. `node radar whoami` 查看当前登录用户的信息。
3. `node radar article <title> [section]` 取得某篇条目或章节的内容。