> 原文：[Inside look at modern web browser (part 1)](https://developers.google.com/web/updates/2018/09/inside-browser-part1)

### CPU, GPU, 内存, 以及多进程架构
这个系列共有4篇，我们将会从Chrome浏览器的高层架构谈到到渲染管道的细节。如果你曾好奇浏览器是怎么将你的代码生成网页，或者你不清楚一些性能优化的实践是建立在哪些原理上的，那这个系列就是为你而准备的。
翻译｜揭示现代浏览器原理(1) — Chrome官方
在这一篇，我们将会谈一些关于计算核心的术语和Chrome的多进程架构。

> ★ 提醒：如果你对CPU/GPU的概念和进程/线程这些概念比较熟悉，可以跳到[浏览器架构](#浏览器架构)的部分

### CPU和GPU是计算机的核心
为了更好了解浏览器运行的环境，我们需要先讲讲计算的部分构成以及它们的作用。

### CPU
首先是中央处理器，英文简称CPU。可以理解为计算机的大脑，由若干个核（即运算单元）组成。可以把CPU的核想象成一个社畜，当接到不同的任务时，他会一个一个地去处理（如下图）。从数学计算到图形处理，只要他知道如何处理你的需求，他都会搞定。以前，大多数CPU都是独立的芯片（即没有集成内存、GPU等），一个核更像是同块芯片内的另一个CPU。现代硬件里，通常都是多核的CPU，并且集成了除计算以外的能力，让手机和电脑拥有更强的算力。
> *注：CPU一般会有多个核，就是市面上宣传的双核、四核等概念。*

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf5eb0aa84e447cd943656672444e8fa~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">CPU的每个核像社畜一样在办公桌上等着任务进来</div>
</center>

### GPU
图形处理单元，英文简称GPU，是计算机的另一个组成部分。不像CPU，GPU则擅长利用多核同时处理单一的任务。通过名字可以知道，它就是为了处理图像而生的。这也就是为什么图像的渲染速度和交互流畅度，经常与“GPU使用”和“GPU支持”这些内容所关联。近些年，利用GPU加速，GPU可以独自完成越来越多的计算工作。

> 这里补充一下，引用网上的通俗比喻，CPU是一个博士啥都懂，显卡是千万个小学生同时计算一个公式。CPU只能一件件的解算，显卡可以千万（上亿）个同时解算。

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f66c098a9ca3470aba449c137758034c~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">许多GPU核拿着扳手，意味着它们每个只能做有限的工作</div>
</center>

当你在电脑或手机启动并运行一个应用程序，这个过程需要CPU和GPU来完成，通常这个过程有操作系统的调度机制去处理。

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2310bc85e4f34216be8b588e3a140fed~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">计算机架构分三层：硬件在底层提供能力，操作系统在中间调度，应用程序在最上层运行</div>
</center>

### 通过进程和线程执行程序
在讲浏览器架构前，还有一个概念需要掌握，就是进程与线程。进程可以理解为一个正在运行的程序。线程则存在进程中，去执行进程中程序的各个部分。

当你启动一个程序，就创建了一个进程，这个程序会选择性地创建若干个线程去干活。在运行程序的过程中，操作系统会分配给进程“内存块”，是这个程序私有的内存空间，用来存储程序的相关状态。当你退出程序，则进程消失，操作系统会将它之前占用的内存释放。

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2616113a72a74c7abab606bb73d437df~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">进程是一个盒子，线程则可以想象成盒子里畅游的鱼</div>
</center>

<center>
    <br>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b4ce278fc364d2597965023128a8954~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <a style="text-decoration: underline;" href="https://developers.google.com/web/updates/images/inside-browser/part1/memory.svg">点击查看动画：使用内存空间并存储应用程序数据的过程</a>
    <br>
    <br>
</center>

一个进程可以要求操作系统启动另一个进程来运行不同的任务。发生这种情况时，将为新进程分配不同的内存。如果两个进程间需要交换信息，它们可以通过进程间通讯机制（IPC）来实现。许多应用程序都有多进程设计，每个模块功能开一个进程，这样如果一个进程故障了，还能保证其他正常运行。

<center>
    <br>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0daccd195126402ba419c04807f358a6~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <a style="text-decoration: underline;" href="https://developers.google.com/web/updates/images/inside-browser/part1/workerprocess.svg">点击查看动画：图解多进程通讯</a>
    <br>
    <br>
</center>

### 浏览器架构
那么一个网页浏览器是怎么通过进程和线程构建出来的呢？简单来说，他可以是由一个进程和许多不同的线程组成，也可以是许多不同的进程和一些通过IPC通讯的线程。

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c32de28b456f496794ad213bd2c06b16~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">基于进程/线程的不同浏览器架构</div>
</center>

需要说明的是，浏览器架构是没有一个标准的，以上都是两种实现方案，不同浏览器间的架构可能会有天壤之别。

而在这个系列，我们将会针对Chrome浏览器最近版本的架构，用图解的方式来讲解浏览器架构。

浏览器有一个主进程，他与负责其他模块的进程协作。对于渲染进程，它会被创建多次并分配给每个分页（tab）。目前，Chrome的调度机制是尽可能给每个分页单独创建一个渲染进程，现在还在尝试给每个网站创建单独的进程，包括iframe。（[详情点击查看](https://developers.google.com/web/updates/2018/09/inside-browser-part1#site-isolation)）

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6f8b168d67d44762874847804221f312~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">Chrome多进程架构：图中渲染进程（Render Process）有多层，表示Chrome创建了多个渲染进程为每个分页服务</div>
</center>

### 进程的分工是怎样的呢？
详见下表：
| 进程的分工  ||
| --------   | -----  | 
| 浏览器主进程 | 控制着一些交互上的功能，如地址栏、书签、前进后退按钮。当然也包括浏览器底层的控制，如网络请求和文件操作权限  |
| 渲染        |   控制分页内，网页展示的一切   |  
| 插件        |    控制浏览器所使用的插件，如flash    | 
| GPU        |    脱离其他进程，单独完成图像处理任务。它还会被分解成多个进程，用于处理不同应用的需求，并将其绘制在同一个面板上   | 

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3b994078af314cebb004bc7009c9320c~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">不同的进程指向不同的模块</div>
</center>

还有更多进程没有提到，如扩展程序进程和浏览器工具进程。如果你想看看有哪些进程运行在你的Chrome上，点击右上角菜单按钮 -> 更多工具 -> 任务管理器。就会打开一个窗口展示给你看，现在有哪些进程在运行，分别消耗了多少CPU和内存资源。

### Chrome多进程架构的优势
前面，我提到Chrome使用多渲染进程。你想象一下，在大多数情况下，Chrome为每个分页（tab）单独创建一个渲染进程。比如有三个分页，如果其中一个卡住了，那么你可以关掉它，继续使用其他分页。如果所有分页共用一个进程，那很不幸，挂一个全遭殃。

<center>
    <br>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d94a8565d03f4c49beff62480b714213~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <a style="text-decoration: underline;" href="https://developers.google.com/web/updates/images/inside-browser/part1/tabs.svg">点击查看动画：分页拥有单独渲染进程</a>
    <br>
    <br>
</center>

多进程架构另一个优势是安全性和沙盒。因为操作系统提供了限制进程权限的方法，所以浏览器可以将某些进程隔离起来。例如，像渲染进程这种需要处理用户输入的进程，Chrome会限制它对任意文件的访问权限。

因为这些进程都有自己专门的内存空间，他们通常会拷贝一份通用的基础工具库进去（比如Chrome的JavsScript解析引擎V8）。这意味着，如果不是同一进程里的线程则不能共享这些基础工具库，造成了内存浪费。为了减少这种浪费，Chrome对进程的数量会有所限制，具体取决于你设备的CPU和内存。当Chrome开的进程数达到了设定的极限，它会开始将同一个网站的分页（tab）运行在同一个进程中，不再为每个分页单独开进程。

### 节约更多内存 - Chrome的服务化
Chrome正在进行架构更改，将这个成熟的方案运用在浏览器的进程管理中，以将浏览器程序的每个部分作为一项服务运行，从而可以轻松拆分为不同的进程或聚合为一个进程。

大概就是当Chrome跑在高性能的机子上，它会将功能服务拆分进不同的进程，从而获得更高的稳定性。相反，如果跑在一些“小霸王”上，则将服务聚合到一个进程上以减少内存占用。在Chrome的这次调整之前，Android平台已经运用这套方案将进程合并来降低内存占用。

<center>
    <br>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89b2c559625f48c686b10255e94c13b8~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <a style="text-decoration: underline;" href="https://developers.google.com/web/updates/images/inside-browser/part1/servicfication.svg">点击查看动画：服务在多进程和单进程间切换</a>
    <br>
    <br>
</center>

### 分站渲染进程 - 站点隔离
[站点隔离](https://developers.google.com/web/updates/2018/07/site-isolation)是最近被引进Chrome的特性，为每个站点（即网站）开一个单独的渲染进程。之前谈到每个分页（tab）单独开一个渲染进程，允许不同站点在其中运行，并共享内存空间。a.com和b.com运行在同一个渲染进程，因为有[同源策略](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)的存在，它是web的核心安全模型，它保证了两个站点间在没有对方允许的情况下，不可以传输数据。但这样还是有隐患，网站安全攻击常常会以绕过此安全策略为首要目标，所以解决这种隐患最有效的方案就是站点隔离。再加上出现[溶毁和幽灵漏洞](https://developers.google.com/web/updates/2018/02/meltdown-spectre)，就更需要将站通过不同进程分开。从桌面版Chrome 67开始，分页内跨站点的iframe都默认会为其单独开一个渲染线程。

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/acccb4cd0d404df9bdde070566c28f24~tplv-k3u1fbpfcp-zoom-1.image">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">分页内不同站点的iframe都被分配了单独的渲染进程（Render Process）</div>
</center>

使站点互相独立是多年工程攻坚的成果，这并不仅仅是分配渲染进程这么简单。它改变了iframe间通信的底层实现，在运行有若干个iframe的页面，每个iframe有自己的进程，当你按F12打开chrome开发者工具时，Chrome后台需要做许多工作才能使开发者工具的启动无缝衔接。哪怕只是简单地用 Ctrl+F 检索全文，也需要通过搜索不同进程中的内容来得到准确结果。这也是为什么浏览器工程师谈起站点隔离时，会说这是个重要的里程碑。

### 总结一下
这篇文章，我们纵览了浏览器的架构和了解了多进程架构的优势。也看到了Chrome的服务化和站点隔离跟多进程架构的紧密联系。[在下一篇，进程与线程时如何合作去展示一个网页的。](https://developers.google.com/web/updates/2018/09/inside-browser-part2)

```!
如有翻译错误，欢迎指正
```