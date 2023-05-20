首先需要说明下，TypeScript 是 JavaScript 的超集，这意味着任何 js 写出来的代码，ts 都必须能声明出对应的类型约束，这就导致 ts 可能会出现非常复杂的类型声明。而一般的强类型语言则没这样的问题，因为在一开始设计之初，那些无法用类型系统声明出来的接口压根就不允许创建。

并且，TypeScript 是结构化类型，有别于名义类型，任何类型是否契合取决于它的结构是否契合，而名义类型则是必须有严格的类型对应。

本文很多内容都是基于上面两点去思考的，下面进入正题。

### 一、关于枚举

1.  **动态枚举**

允许在枚举中初始化动态的数值，但字符串不行

```
// 动态数值
enum A { 
    Error = Math.random(),
		Yes = 3 * 9
}

// 当带有字符串时则不可以
enum A {
    Error = Math.random(), // Error：含字符串值成员的枚举中不允许使用计算值
    Yes = 'Yes',
}
```

2.  **数字和字符串枚举的检查宽松度不同**

```
// 数字枚举的宽松检查
enum NoYes { No, Yes }
function func(noYes: NoYes) {}
func(33); // 并不会报类型错误！

// 字符串枚举却报错
enum NoYes { No='No', Yes='Yes' }
function func(noYes: NoYes) {}
func('NO'); // Error: 类型“"NO"”的参数不能赋给类型“NoYes”的参数
```

之所以允许数字随意赋值给枚举，我猜也是因为允许动态数值枚举的关系，默认枚举可能为任意数字。

3.  **作为对象**

字符串和枚举值不兼容，但因为 ts 是结构性类型系统，枚举本身却又可以兼容对象

```
enum NoYes {
  No = 'No',
  Yes = 'Yes',
}
function func(obj: { No: string }) {
    return obj.No;
}
func(NoYes); // 编译通过
```

4.  **存在问题的双向映射**

```
enum Foo {
    a,
    b
}

// 编译后带来了双向映射的特性
var Foo;
(function (Foo) {
    Foo[Foo["a"] = 0] = "a";
    Foo[Foo["b"] = 1] = "b";
})(Foo || (Foo = {}));

// 反向映射
Foo[0] === 'a' 
```

但当两个枚举都指向同一个数字时，会出现问题：

```
enum Foo {
    a = 0,
    b = 0
}

Foo[0] === 'b' // 'a' 无法反向映射
```

如果是动态枚举，就更可能暴露这个问题了。

**为什么有人不建议使用 enum？**

-   数字和字符串枚举的检查宽松度不同；
-   双向映射存在问题；
-   ts enum 编译后的代码增加了复杂度，并不符合直觉，如果因此导致了 bug 会很难排查，因为一般人不认为编译器会出错；
-   这些新加入的特性违背了 typescript 一开始承诺的”仅扩展类型“。

综上所述，很多人建议使用联合类型或 Object as const 来替代 enum，但用联合类型会带来很多魔法数字，用 Object 则需要通过 keyof 的方式来类型声明，多少有点不优雅。所以除非对 enum 的缺点完全无法容忍，目前还没有更好的替代方案。

### 二、重载为什么不能分开写

ts 中的重载，不同于传统的重载，只是函数签名的重载，并不提供类型约束功能。

ts 中的函数重载：

```
function foo(p: string);
function foo(p: number);
function foo(p: string | number) { ... };
```

java中的重载：

```
public class Overloading {
    public int foo(){
        System.out.println("test1");
        return 1;
    }
 
    public void foo(int a){
        System.out.println("test2");
    }   
}
```

**不支持分开写重载的原因是：**

-   传统的重载是在编译时将重载函数拆分命名（func 拆分为 func1、func2），再在调用处修改命名，从而达到通过参数区分调用的效果。而 JavaScript 在运行时可以随时修改类型，如果依然采用传统重载的编译规则，可能会导致不可预期的问题。
-   ts 与 js 可交互性受影响，如果像传统重载那样，将函数拆分，在 js 脚本里调用 ts 中的重载方法将会有问题。
-   typescript 是结构化类型，如果一个函数同时满足多个重载，那么最终无法确定要选择调用哪一个。
-   就算上面的问题都解决了，这也不符合 ts 的[设计原则](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Design-Goals#goals)，ts 从设计上希望保留 js 完整的运行时行为，并且在语法设计上与当前和未来的 ECMAScript 提案保持一致。

所以 ts 目前及未来都不会支持传统重载，并且[传统重载也存在自己的问题](https://gitbook.cn/books/5d68a6e202d5047dfba972c8/index.html)，并非完美。

### 三、为什么要有 any

设想一个场景，一个函数需要接受一个数组，数组内数据可以是任意类型，泛型不好解决这个问题，所以还得引入 any，而 unkown 是后来引入来代替 any 的。但在一般的强类型语言通常不具备那么多灵活性，比如数组只允许一种类型，那就可以通过泛型来解决。

![Untitled](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a0582bc0a6e43358b62f888cd61a87f~tplv-k3u1fbpfcp-zoom-1.image)

JSON.parse 的类型声明也是 any，因为当初还没有 unkown，不然应该返回 unkown 更合理。

### 四、图灵完备的类型系统

TypeScript 为了不减弱 JavaScript 的灵活性，同时又能提供足够的类型约束，就带来了图灵完备的类型系统。

下面用类型来实现一个自动声明 N 个长度的定长数字数组，过程需要用到递归

```
type ToArr<N, Arr extends number[] = []>
    = Arr['length'] extends N // 判断数组长度是否达到
				? Arr // 长度够则直接返回
				: ToArr<N, [...Arr, number]>; // 长度不够则递归

type Arr1 = ToArr<3>; // [number, number, number]
```

更进一步，甚至可以基于上面的 ToArr 再实现**加法**：

```
type Add<A extends number, B extends number> = [...ToArr<A>, ...ToArr<B>]['length'];
type Res = Add<3, 4>; // 7
```

甚至有人用 ts 的类型系统实现了[象棋规则](https://zhuanlan.zhihu.com/p/426966480)。

### 五、readonly 和 as const

两者都可以将变量声明成**仅可读**，而 as const 是将类型**转换成常量**。下面再看看两者的一些细节。

```
interface Foo {
    readonly a: {
        b: number,
    },
}

const f: Foo = {
    a: { b: 1 },
};

f.a = { b: 2 }; // Error: 无法分配到 "a" ，因为它是只读属性

f.a.b = 2; // 这里则没问题
```

上面可以看出，readonly 只对当前对象有效，对其属性无效。但 readonly 对数组却能做到完全不可修改。

```
const arr: readonly number[] = [2];
arr.push(1); // Error: 类型“readonly number[]”上不存在属性“push”
```

as const 把一个可变长度的数组声明变成一个固定长度的数组：

```
const args = [8, 5]; // number[]
const func = (x: number, y: number) => {};
const angle = func(...args); // 这里会提示错误，因为ts不确定args是否有两个数

const args = [8, 5] as const; // 加上as const，将args转换成[number, number]即可
func(...args); // OK

// 同时也不允许修改数组
args.push(2) // Error: 类型“readonly [8, 5]”上不存在属性“push” 
```

### 六、类型约束与控制流

在回调函数中已收窄的类型约束将被重置，因为该回调可能会在任何地方被调用，而里面通过闭包访问的变量有被更改的风险。

具体看下面例子：

```
function bar() {
    let v1: string | undefined = '123';

    if (!v1) return; // 这里类型收束并未在返回的闭包中生效

    return () => {
        v1.charAt(0); // error: 对象可能为“未定义”
    };
}
```

如果要解决这个问题，tsc 就需要在编译时做作用域内的引用分析，这个不但会有性能隐患，也大大增加了 tsc 的复杂性。并且如果不使用 tsc，而是基于 babel 的 typescript 编译是不会进行 import 引用分析，编译时的上下文仅局限在当前文件。

所以对于控制流的条件约束，typescript 采用了悲观策略，即默认变量有可能被修改。

但这也会存在问题：

```
enum Result {Yes, No}

let res = Result.Yes;

function changeResult() {
    res = Result.No;
}

if (res === Result.Yes) {
    changeResult();
    if (res === Result.No) { // Error: 此条件将始终返回 "false"
        // ...
    }
}

// 如果要解决上述错误，只需要将 res 替换为 getRes()
function getRes() {
    return res;
}
```

### 七、协变和逆变

-   协变：子类型兼容父类型，即 Array<Father>.push(Son)，这是可以成立的，因为 Son 是 Father的子类型，继承了所有 Father 的属性，所以对其兼容；
-   逆变：父类型兼容子类型，与上面相反，具体看下面例子；

```
declare let animalFn: (x: Animal) => void;
function walkdog(fn: (x: Dog) => void) {}
walkdog(animalFn); // OK
```

这里 animalFn 的参数声明需要的是 Dog，但实际传入的是 Animal，上面的本质就是 (x: Dog) => void = (x: Animal) => void ，所以参数是将 Animal 赋值给了 Dog，所以是 Animal 对 Dog 兼容，即逆变，如果将这个场景反过来，反而会出错。所以函数的参数是逆变，返回值是协变。

但 ts 的函数类型其实是双向协变的，但这并不安全，具体看下面例子：

```
declare let animalFn: (x: Animal) => void
declare let dogFn: (x: Dog) => void
animalFn = dogFn // OK，但这不安全
dogFn = animalFn  // OK

// 虽然在 ts 里像上面那样双向赋值（双向协变）是可以通过的，但这是不安全的

const animalSpeak = (fn: AnimalFn) => {
    fn(animal); 
};
animalSpeak((x: Dog) => {
    x.汪汪() // 这里运行会报错，因为传入的 Animal，不具备 dog.汪汪 方法
}); 
```

上面 animalSpeak 的调用，实际是将 Animal 作为参数赋值给了 Dog，这不满足函数参数逆变的原则，但在 ts 中却是可以通过编译的。

**为什么 ts 允许函数双向协变**：因为 ts 是结构化语言，如果 Array(Dog) 可以赋值给 Array(Animal)，那么就意味着 Array(Dog).push 可以赋值给 Array(Animal).push ，从而导致设计上就允许了双向协变，这是 ts 设计者为了维持结构化类型兼容的一种取舍。但毕竟双向协变是不安全的，所以在 2.6 版本后，开启 strictFunctionTypes 模式，函数参数协变将会报错。关于双向协变具体可以看下面的例子：

``` typescript
interface Animal { eat: '' }
interface Dog extends Animal { wang: '' }

let animalArr: Animal[] = [];
const dogArr: Dog[] = [];
 
animalArr = dogArr; // OK

// Array<Animal>.push(Animal): number = Array<Dog>.push(Dog): number（参数协变）
animalArr.push = dogArr.push; // OK
```

参考：

[](https://exploringjs.com/tackling-ts/toc.html)<https://exploringjs.com/tackling-ts/toc.html>

[](https://www.zhihu.com/question/63751258)<https://www.zhihu.com/question/63751258>

[](https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html#%E4%B8%80%E4%B8%AA%E6%9C%89%E8%B6%A3%E7%9A%84%E9%97%AE%E9%A2%98)<https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html>

[](https://zhuanlan.zhihu.com/p/143054881)<https://zhuanlan.zhihu.com/p/143054881>

[](https://zhuanlan.zhihu.com/p/143789846)<https://zhuanlan.zhihu.com/p/143789846>