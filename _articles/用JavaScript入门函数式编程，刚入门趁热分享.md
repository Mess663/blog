# 函数式编程

### 命令式和声明式

我们入门编程的时候，通常都是从命令式编程开始，即最简单的过程式代码。后来为了处理大型项目又接触到面向对象，也属于命令式。而函数式编程属于声明式，其实它的出现早于面向对象。

MySQL就是一个很好的声明式语言的例子，它仅仅是声明了流程，却没有将过程的细节暴露出来。

``` MYSQL
SELECT * from data_base WHERE author='jack';
```

再举一个例子来比较命令式和声明式的代码：

``` JavaScript
const arr = [1, 2, 3, 4, 5]

// 要求将上面的数组中小于 3 的去掉，并且将剩下的数乘上 2

// 命令式
const result = []
for (let i=0; i<arr.length; i++) {
    if (arr[i] >= 3){
        result.push(arr[i] * 2)	
    }
}

// 声明式
const result = arr.filter(n >= 3).map(n => n*2)
```

看了上面的例子你可能会想，声明式的代码就这？再看看上面的 MySQL 的例子，声明式确是如此，通过 filter、map 等方法，封装了细节，然后将逻辑声明出来，并不需要一步一个命令地说明要怎么做，所以更简洁，而这就是最基本的声明式代码。

当我们学面向对象的时候，都会先知道它的三个特性：封装、继承、多态。基于这三个特性，人们在编写代码会延申出很多最佳实践，即设计模式，如工厂模式、依赖注入等。而函数式编程也是如此，有对应的特性和最佳实践。

![Untitled.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97e5025d77e8486fac68d1a7fd3534cb~tplv-k3u1fbpfcp-watermark.image?)

### 函数式

函数式编程是以函数为主的编程风格，其实程序就是由一段段逻辑组成，而将这些逻辑分割成一个个函数，再将其组合发挥到极致。

函数式解决了一个问题，当命令式的风格写代码时，一开始你可以很直接的完成任务代码，但当你开始考虑边界处理和代码复用，渐渐的，你的代码会逐渐背负它本不该有的复杂度，而函数式编程能解决这个问题。

**程序的本质，除了是数据结构和算法，还可以是计算和副作用。**

``` JavaScript
// 先看个例子，从 localStorage 中取出所有用户数据，并找出年龄最大的，显示在 DOM 上
const users = localStorage.getItem('users')
const sortedUsers = JSON.parse(users).sort((a, b) => b.age - a.age)
const oldestUser = sortedUsers[0]
document.querySelector('#user').innerText = oldestUser.name
```

上面的代码很平常，但是理解起来却需要一定时间，先做个函数式的优化，将上面所有步骤封装一下。

``` JavaScript
const getLocalStorage = (key) => localStorage.getItem(key);
const getSortedUser = users => users.sort((a, b) => b.age - a.age)
const first = arr => arr[0]
const writeDom = selector = text => document.querySelector(selector).innerText = text;
const prop = key = obj => obj[key]

writeDom('#user')(prop('name')(first(getSortedUser(JSON.parse(getLocalStorage('user'))))))
```

我知道上面的代码看起来比较奇怪，一是最终调用逻辑需要从右向左看，二是 writeDom、prop 这样分多次将参数传入，即柯里化。尽管它看起来奇怪，逻辑上确实比之前更清晰易读，并且所有函数都灵活、易扩展。

这就是函数式代码，强调声明式的代码以及函数的灵活组合。**函数式编程的目标是使用函数来抽象作用在数据之上的控制流与操作，从而在系统中消除副作用并减少对状态的改变**。后面会更加详细地阐述这点。

下面对代码进一步优化。

### 柯里化

柯里化即把一次传入多参数的函数，转换成能分次传入参数的函数。但是现在我们需要讨论一个参数先后顺序的问题，比如对 Array.map 进行柯里化封装，不同的参数顺序会导致不同的效果：

``` JavaScript
const listMap = fn => list => list.map(fn)
const allAddOne = listMap((o) => o + 1)
allAddOne([1, 2]) // [2, 3]

// 如果反过来会是下面这样

const listMap2 = list => fn => list.map(fn)
const mapList = listMap2([1, 2])
mapList(o => o + 2) // [2, 3]
```

前者先传 fn 再传 list 更符合函数式的规则，因为**函数式是针对逻辑的组合，而不是针对数据的组合**。这也解答了为什么前面的例子需要把部分函数柯里化，这样更方便组合。

### 优化代码——函子（functor）

其实我以前就写过如下的声明式代码：

``` JavaScript
// [1, 2] => [1, 2, 3] => [2, 3] => [6, 9]
[1, 2]
    .concat([3])
    .filter(x => x > 1)
    .map(x => x * 3)
```

我以前写的时候就觉得这种链式调用的写法非常的清晰，要是所有逻辑都可以这么写就好了，而函数式编程就是这么个思路。如果我们要处理非数组时，其实我们可以用一个数组将其包裹，如
 
``` JavaScript
// ['    123 '] => ['123'] => [123] = [124] ⇒ 124
['    123 ']
    .map(o => o.trim())
    .map(o => Number(o))
    .map(o => o + 1)
    .pop() // 124
```

但是上面这么做并不优雅，每次都要包裹在数组里。所以我们可以创建一个包含 map 方法的对象，从而实现链式调用：

``` JavaScript
const Box = (v) => {
    return {
        map(fn) { // 将数据放进盒子
            return Box(fn(v)) 
        }, 
        getValue() { // 从盒子中取出数据
            return v 
        }
    }
}

// 重写上面的例子
Box('    123 ')
    .map(o => o.trim())
    .map(o => Number(o))
    .map(o => o + 1)
    .getValue() // 124

// 重写前面的例子
Box(getLocalStorage('user'))
    .map(JOSN.parse)
    .map((o) => o.sort((a, b) => b.age - a.age))
    .map(first)
    .map(prop('name'))
    .map(writeDom('#user'))

// 比起之前的一长串，这样看起来清爽多了
```

而这个**带 map 方法的 Box** 在函数式编程中称为函子（functor），即一个包裹着数据的容器，它提供链接数据操作的能力。

### 进一步实践——Maybe

但上面的例子还有个问题，就是 getLocalStorage 不一定会返回有效数据，也可能是 undefined，这样会导致后续报错。所以，最好就是在遇到目标不存在的情况时，能跳过接下来的所有操作。

函数式的思路是，我们写两个 Box，一个叫 Just ，他会正常处理所有流程，另一个叫 Nothing ，它会自动跳过所有的流程，只需要在一开始判断用哪一个 Box 即可。

``` JavaScript
// 有值
const Just = (val) => ({
    map: (f) => Just(f(val)),
    getValue: () => val,
    isJust: () => true
}) 
// 无值
const Nothing = () => ({
    map: (f) => Nothing(), // Nothing 不会执行后续的所有操作
    getValue: (defaultVal) => defaultVal,
    isJust: () => false
}) 
// 再用一个 Maybe 来判断使用两个特殊的 Box 中的哪一个
const Maybe = (val) => val === null || val === undefined ? Nothing() : Just(val)

// 用 Maybe 重写前面的例子
Maybe(getLocalStorage('user'))
    .map(JOSN.parse)
    .map((o) => o.sort((a, b) => b.age - a.age))
    .map(first)
    .map(prop('name'))
    .map(writeDom('#user'))
```

上面的Maybe 也叫做 **Monad ，是基于函子（Box）所实现的，可以理解为 Monad 是专门处理某些场景的函子，类似的 Monad 还有很多，用于处理函数式下遇到的各种场景。后面还会介绍另一个常见的 Monad。**

### 纯函数和副作用

其实 React 中每一个渲染函数都是一个纯函数，相当于 UI = Funtion(state)。所以每次修改 state 后，React 的会重新跑一边渲染函数，**只要传入一样参数，无论调用多少次，渲染出来的 UI 都是一致的**，这就是纯函数**。**

纯函数有什么优点呢？1、无副作用，可任意放置，不影响上下文，易于组合；2、易于维护和重构，只要输入输出一致，随便改都不会影响外部；3、输出稳定，易于单元测试；4、输入和输出完全对应，便于缓存，只需判断输入是否更改就行。

但是纯函数的另一面就是副作用，因为现在的程序在运行中必然需要做 IO 操作（请求、操作DOM等），这些就是所谓的副作用，如果一个函数包含了副作用，那么就无法做到多次调用结果一致，指不定哪一次内部的变量就被副作用修改了。

而 React 处理副作用的方式是使用 useEfffect，来将副作用收集起来，虽然无法将副作用完全去除，但可以收集起来统一管控。这也是为什么 useEffect 内的函数并非在执行渲染函数过程中就执行，而是维护成队列，在渲染完后再执行，就是为了统一处理副作用，保持渲染函数的纯净。

那么在一般的函数式编程中，如何处理副作用呢？

### 副作用——IO Monad

跟 React 的思路一样，集中处理。将副作用包裹在函子中，并添加一个 runIO 方法，这样有个好处，就是在最终 runIO 方法调用时才执行，这样就能很安全地拿捏副作用了。
 
``` JavaScript
const IO = (fn) => {
    return {
        map(fn) {
            return IO(() => fn(sideEffectFn())) // 让所有副作用延迟执行
        },
        runIO() { // 显示调用 IO ，使得我们可以将 IO 操作更明显地放在一起，方便管理
            fn()
        },
    }
}

// 例子：
const getNumDom = () => document.querySelector('#num')
const writeNum = (text) => {
    document.querySelector('#num').innerText = tex
}
const ioEffect = Maybe(getLocalStorage('user'))
                .map(JOSN.parse)
                .map((o) => o.sort((a, b) => b.age - a.age))
                .map(first)
                .map(prop('name'))
                .map(o => IO(() => writeDom('#user')(o)))
 
ioEffect.getValue().runIO() // 一次运行副作用
```

这样除了可以集中把控副作用外，还可以将读数据、处理数据、写数据很清晰的分离，并且更利于阅读和维护

但上面返回的是 Maybe(IO(o))，Monad 出现了嵌套，导致最终调用冗余： ioEffect.getValue().runIO() 。这时候我们只需要给 Maybe 加一个 foldMap 方法即可，这个方法目的是在传入下一个 Monad 时接触嵌套。

``` JavaScript
...
foldMap(monad) {
    return monad(val)
}
...

// 重写上面嵌套的例子

const ioEffect = Maybe(getLocalStorage('user'))
                .map(JOSN.parse)
                .map((o) => o.sort((a, b) => b.age - a.age))
                .map(first)
                .map(prop('name'))
                .foldMap(o => IO(() => writeDom('#user')(o)))

ioEffect.runIO()
```

通过 foldMap 可以解决 Monad 嵌套的问题，所以 **foldMap 就是 Monad 必须的一个方法**。

### 组合函数，让数据的流动更简洁

Box.map(fn).map(fn) 虽然看起来很清晰，但其实还有一种写法能组合函数，就是写一个方法将所有函数组合起来，省去 map，看起来更简洁。尝试写一下这个方法，就叫它 pipe ，像水管一样组合函数：

``` JavaScript
const pipe = (...fns) => (arg) => fns.reduce((lastVal, fn) => fn(lastVal), arg)
```

为了能将 Monad 也放进 pipe 中，我们需要再封装一下 map 和 foldMap 这两个必要的方法：

``` JavaScript
const map = fn => monad => monad.map(fn)
const foldMap = fn => monad => monad.foldMap(fn) 

// 重写前面的例子
const ioEffect = pipe(
  getLocalStorage,
	Maybe,
	map((o) => o.sort((a, b) => b.age - a.age))
  map(first)
  map(prop('name'))
  foldMap(o => IO(() => writeDom('#user')(o)))
)('user')

ioEffect.runIO()
```

### 利用成熟库

###

现在市场上两个比较成熟的 JavaScript 工具库—— lodash/fp 和 Ramda ，它们所包含的工具函数都实现了柯里化，并且是默认先传函数再传被处理的数据。柯里化再配合上面的 pipe 方法，则可以像下面这样写：

``` JavaScript
const arr = [{n: '5'}, {n: '12'}]

// 日常写法
arr
    .map(o => o.n)
    .map(o => Number(o))
    .filter(o => o < 10) // => [5]

// 配合 lodash/fp
import { map, filter } from 'lodash/fp'
pipe(
    map('n'), 
    Number, 
    filter(o => o < 10)
)(arr)
```

这种写法也叫做 point free，即只考虑函数组合，并不需要考虑参数什么时候传入，因为最终它们会形成一个管道，一头入参，另一头自然就出现结果，而中间的过程是可以任意替换的。

**参考：**

[](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/)<https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/>

[](https://book.douban.com/subject/30283769/)<https://book.douban.com/subject/30283769/>

[](https://egghead.io/lessons/javascript-linear-data-flow-with-container-style-types-box)<https://egghead.io/lessons/javascript-linear-data-flow-with-container-style-types-box>

[](https://www.ruanyifeng.com/blog/2017/03/pointfree.html)<https://www.ruanyifeng.com/blog/2017/03/pointfree.html>