长时间使用鼠标导致手腕有点不舒服，所以就考虑全键盘工作的方案，经过一番探索，找到了一个比较适合自己平时工作环境的方案，基本能做到78.9%的工作只用键盘就能完成，右手不用一直键鼠切换。

思路是大量使用快捷键和VSCode Vim，介绍主要分三部分：**编码、浏览器、系统**。下面详细介绍下需要的工具和常用的快捷键，据我的经验，2、3天就能上手了。

### 一、编码

> 我没直接用vim，而是使用VSCode的vim插件。是因为要完整配置一套适用当前工作环境的vim插件，非常麻烦，有些用起来甚至不如VSCode自带的，在用Vim开发完一个小项目后我就放弃了。还有一个原因是在windows打造一个好用的命令行工具也很麻烦。总之是烦上加烦。

**VSCode常用快捷键**

- Ctrl-e：资源管理器
- Ctrl-f/Ctrl-F：当前文件搜索文字/全局搜索文字
- Ctrl-[N]：切换回第N个编辑窗口
- Ctrl-p：搜索并打开文件
- Ctrl-.：打开自动修复菜单
- Ctrl-`：唤起/收起终端

> 快捷键文档：https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf

**VSCode Vim插件**

- Vim是一个功能强大的编辑器，不了解的话可以看看[这个](https://www.runoob.com/linux/linux-vim.html)
- Vim常用的三种模式：
    - 普通模式：默认模式，主要用于光标移动（在任意模式按Esc或Ctrl-c会返回普通模式）
    - 输入模式：输入文字内容（快捷键：i）
    - 选中模式：选择文字（快捷键：v）
- 普通模式常用按键（大部分选中模式也通用）
    - j/k/h/l：上下左右（文件资源管理器里也可以通过这个快捷键移动，左右快捷键分别对应进入上级/下级文件）
    - N+移动：数字加上面的移动键可以一次跳多行
    - w/b/e/ge：以单词为长度移动
    - ^/$：移动光标至行首/行尾
    - d：删除，按两下d则是删除当前行，可配合上面的移动操作，删除其他位置
    - gg/G：文档最前/最后
    - gd：查看/进入引用
    - c/d/y i ( ：修改/剪切/复制（）内的字符，其他如“”、<>等成对符号同样可以这样操作
    - za：折叠/收起当前代码块
    - space*2+w/b/e/ge：将光标快速移动到可见范围内任意处

        > 这个插件默认推荐设置space为leader键，leader键就是跟Ctrl一样的前缀键，可以设置成任意一个按键，用于丰富按键组合

        ![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/15d844c2d7d34690861d3227ed3dd0c2~tplv-k3u1fbpfcp-zoom-1.image](https://s3.ax1x.com/2021/03/05/6mGjAJ.png)

    - q[a-z]: 录制操作，并命名为a-z中的一个字母，再按一次q就停止录制，@[a-z]则是执行所录制的操作 ，更多高级的操作可以看下文档
    - :%s/[old]/[new]/[gci]：全局将[old]替换为[new]，g表示全局，c标识每个替换都需要手动确认，i表示查找不区分大小写
    - Ctrl-o/Ctrol-i：移动光标到上/下一个位置，即前进后退
    - ys[motion][替换字符]：在某个动作选取的范围内添加围绕字符，这个motion是指类似w/b这种具有光标跳转能力的动作

> 文档：https://github.com/VSCodeVim/Vim/blob/master/ROADMAP.md

---

### 二、浏览器

**Vimium插件**

这个插件提供大量快捷键用于浏览器的各种交互，强大到可以应付大部分场景，但毕竟浏览器是图形界面工具，所以有很多地方还是无法完全依靠键盘，比如有双滚动条、拖拽类交互的场景

**常用命令：**

- j/k/h/l：上下左右滚动
- u/d：上下翻页
- f/F：唤出所有可点击的地方快捷键，如是可跳转链接，小写是当前页，大写是新开页面

    ![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60276847d1f0403687c702c56b856d7c~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f05997c96a914f2da7b220317bad5936~tplv-k3u1fbpfcp-zoom-1.image)

- J/K：左/右切换tab
- yy：复制当前网址
- gg/G：滚动至顶部/底部
- o：搜索书签和历史记录
- yy：复制当前网址

> 下面是完整快捷键表

![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ff90b9f037746e1b2cb4ac67abc23e4~tplv-k3u1fbpfcp-zoom-1.image](https://s3.ax1x.com/2021/02/25/yj7SIJ.png)

---

### 三、系统（windows）

- 任务窗口切换：win+数字（窗口在任务栏的排序位置），建议将常用软件固定在任务栏
- 将任务窗口调至左/右：win+左/右方向键，配合[PowerToys](https://github.com/microsoft/PowerToys)效果更好（下图），PowerToys除了窗口布局外，还有键盘映射、文件预览/批处理等功能

    ![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6534059b049248c68f49f65924705bec~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4f8edd655ef45acafd18f3f9508d9cb~tplv-k3u1fbpfcp-zoom-1.image)

- Ctrl+Shift+w：切换至企业微信，再按一次则进入最新未读一个消息窗口，并自动聚焦输入框（一般其他通讯软件也可设置）
- [uTools](https://u.tools/)：有丰富插件的生产力工具
    - 推荐功能：*超级面板*，配合众多插件，或者自己写的脚本，一键呼出，贼方便

    ![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b28c3ee904047e98108d4c5d2c63d5f~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/886241cd328b4c55ba1ff8daa5286012~tplv-k3u1fbpfcp-zoom-1.image)

    - 插件推荐：图床上传（配合超级面板如上图）、markdown编辑器、自动化助手（脚本）、变量名翻译等

> 如果是mac，推荐[Apptivate](http://www.apptivateapp.com/)，可以自定义快捷键切换应用，方便多应用全屏切换。

这个方案，唯一有学习成本的就是Vim的输入方式，可能一开始不太习惯，但是记住几个常用快捷键后很快就能上手，熟练后，速度能比切换键鼠来的快。

有一个建议，使用这套解决方案里，很多时候需要频繁使用**Esc**键，所以我把**Esc**和**Caps**键对调了，感觉挺好用的。

纯键盘操作，还有一个好处，就是哪怕你浏览网页摸鱼，在其他人看来你也是在认真地敲击键盘。