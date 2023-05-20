![https://zhuanlan.zhihu.com/p/97768916](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e12c3167537a4413a3e52bb37812a9eb~tplv-k3u1fbpfcp-zoom-1.image)
> 图片来源：https://zhuanlan.zhihu.com/p/97768916

就像上图一样，这篇主要介绍Blob和ArrayBuffer相关的一些API之间的关系和用途，并不会详细介绍每个属性和方法，更多的是想讲述清楚一些概念。

### Blob
我们在做预览本地图片需求时往往需要再`<Input>`中拿到File对象，再根据File生成一个Blob URL从而放进`img src`中显示。

其实`<input>`中的File实例对象和[`DataTransfer`](https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer)对象（拖拽）是一个**特殊的 Blob 实例**，继承了Blob的属性和方法，只是增加了name和lastModifiedDate等专有属性。

Blob对象表示一个不可变、原始数据的类文件对象，它的数据可以按文本或二进制的格式进行读取，也可以转换成 ReadableStream（读写流） 来用于数据操作。 

我们**无法直接在 Blob 中更改数据**，但我们可以通过 slice 将 Blob 分割成多个部分，从这些部分创建新的 Blob 对象，将它们组成新的 Blob。

```js
    // 从字符串创建 Blob
    const blob = new Blob(['hello', ' ', 'world'], {type: 'text/plain'});
    
    // 截取blob中不同下标之间的字节
    const newBlob1 = blob.slice(0, 2)
    const newBlob2 = blob.slice(6, 8)
    
    // 组合成新的blob
    const newBlob3 = new Blob([newBlob1, ' ', newBlob2], {type: 'text/plain'})
    newBlob3.text().then(console.log) // he wo
```

### Blob URL
通过`URL.createObjectURL`可以为Blob生成*Blob URL*，最常用到的场景就是展示本地图片，将File生成的Blob URL放进img src中。

和较长的Base64格式的Data URL相比，Blob URL的长度显然不能够存储足够的信息，这也就意味着它只是类似于一个**浏览器内部的“引用”**。从这个角度看，Blob URL是一个浏览器自行制定的一个**伪协议**。也正是因为Blob数据是存储在内存中，它的**生命周期**和创建它的窗口中的` document ` 绑定，所以当用完了这个URL最好手动将其占用的内存释放。如果想要将信息留存下来作为url，将Blob对象转换为base64也是个方案。

### FileReader
通过FileReader将Blob对象转为**字符串、ArrayBuffer和base64**；
```js
    // 将字符串转换成 Blob对象
    const blob = new Blob(['中文字符串'], {type: 'text/plain'});
    const reader = new FileReader();
    
    // 将Blob 对象转换成字符串
    reader.readAsText(blob, 'utf-8');
    reader.onload = function (e) {
        console.info(reader.result);
    }
    
    // 将Blob 对象转换成 ArrayBuffer
    reader.readAsArrayBuffer(blob);
    reader.onload = function (e) {
        console.info(reader.result); 
    }
    
    // 将Blob 对象转换成 base64
    // FileReader.readAsDataURL()
```

### Blob应用场景：
- 将blob转为blob URL或data URL作媒体资源，即本地媒体文件显示；
- 将blob通过slice进行分割从而实现分段上传；
- canvas输出二进制图像数据；（`HTMLCanvasElement.toBlob`）
- ...

-----

### ArrayBuffer、TypedArray和DataView
**历史**：为了充分利用**3D图形API和GPU加速**在canvas上渲染复杂图形，出现了WebGL(Web Graphics Library)。但因为JavaScript运行时中的数组并不存在类型，所以当WebGL底层与JavaScript之间传递数据时，需要**为目标环境分配新数组**，并以当前格式迭代，这将花费很多时间。

为了解决这个问题，则出现了**定型数组(TypeArray)**。通过定型数组JavaScript可以**分配、读取、写入数组**，并直接传给底层图形驱动程序，也可直接从底层获取。

既然定型数组赋予JavaScript跟底层进行数据交换的能力，那么就同样会出现与**其他设备/网络**进行二进制数据的交流，应对更复杂的场景，**DataView**也应运而生。

他们以数组的语法处理二进制数据，所以统称为二进制数组，**TypedArray和DataView**可以像C语言一样通过修改下标的方式直接操作内存。

ArrayBuffer对象存储原始的二进制数据，只是容器，需要TypedArray和DataView来读写。TypedArray视图用来读写**单一类型**的二进制数据，DataView视图用来读写**复杂类型的二进制数据**。

ArrayBuffer对象作为内存区域，可以存放多种类型的数据。同一段内存，不同数据有不同的解读方式，这就叫做“视图”（view）；
```js
    const buffer = new ArrayBuffer(12);

    const x1 = new Int32Array(buffer);
    x1[0] = 1;
    const x2 = new Uint8Array(buffer);
    x2[0]  = 2;
    
    x1[0] // 2
    
    // 由于两个视图对应的是同一段内存，一个视图修改底层内存，会影响到另一个视图。
```

本来，在设计目的上，ArrayBuffer对象的各种TypedArray视图，是用来向网卡、声卡之类的本机设备传送数据，所以使用本机的字节序就可以了；但由于不同设备的操作系统中字节序的不同，所以需要DataView视图来做支持，它是用来处理网络设备传来的数据，可以自行设定大端字节序或小端字节序；

### 字节序
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4bde830e05ce41f6b8d020e6d10bafb9~tplv-k3u1fbpfcp-zoom-1.image)
> 0x1234567的大端字节序和小端字节序的写法如上图，图片来源：https://www.ruanyifeng.com/blog/2016/11/byte-order.html

- 大端字节序：高位字节在前，低位字节在后，这是人类读写数值的习惯顺序；
- 小端字节序：低位字节在前，高位字节在后；

计算机电路先处理低位字节，效率比较高，因为**计算都是从低位开始**的。所以，计算机的内部处理都是小端字节序。但是，人类还是习惯读写大端字节序。所以，**除了计算机的内部处理，其他的场合几乎都是大端字节序**，比如网络传输和文件储存。（计算机内部都是使用小端字节这点不严谨，有人说是因为不同公司的习惯而已，因为X86和ARM架构是使用小端，但IBM的PowerPC是用大端，但这里不深究）

一般向外部写入数据是不需要管什么字节序的，直接用本机字节序即可，因为被写入的设备会有对应的驱动去判断字节序并正确读取数据。

### ArrayBuffer
ArrayBuffer对象用来表示**通用的、固定长度**的原始数据缓冲区，是一个普通的JavaScript构造函数，可用于内存中分配特定数量的字节空间。ArrayBuffer本身是可读不可写的，只是一个**数据容器**。
```js
    const buf = new ArrayBuffer(16) // 在内存中分配16字节
    console.log(buf.byteLength) // 16
```

ArrayBuffer和JavaScript数组在使用上是完全不同的，有三个区别：
- ArrayBuffer初始化后是**固定大小的，并且可读不可写**；
- 数组里面可以放**数字、字符串、布尔值以及对象和数组**等，ArrayBuffer放**0和1**组成的二进制数据；
- ArrayBuffer放在**栈**中，而Array放在**堆**中；

### TypeArray
TypeArray是一个统称，实际使用的是特定元素类型的类型化数组构造函数；
```js
    const typedArray1 = new Int8Array(8);
    typedArray1[0] = 32;
    
    console.log(typedArray1);
    // Int8Array [32, 0, 0, 0, 0, 0, 0, 0] 
    
    // 总共有
    Int8Array(); 
    Uint8Array(); 
    Uint8ClampedArray();
    Int16Array(); 
    Uint16Array();
    Int32Array(); 
    Uint32Array(); 
    Float32Array(); 
    Float64Array();
```

TypeArray操作的数组成员都必须是同一个数据类型。每一种视图的构造函数，都有一个BYTES_PER_ELEMENT属性，表示这种数据类型占据的字节数。
```js
    Int8Array.BYTES_PER_ELEMENT // 1
    Uint8Array.BYTES_PER_ELEMENT // 1
    Uint8ClampedArray.BYTES_PER_ELEMENT // 1
    Int16Array.BYTES_PER_ELEMENT // 2
    Uint16Array.BYTES_PER_ELEMENT // 2
    Int32Array.BYTES_PER_ELEMENT // 4
    Uint32Array.BYTES_PER_ELEMENT // 4
    Float32Array.BYTES_PER_ELEMENT // 4
    Float64Array.BYTES_PER_ELEMENT // 8
```

由于视图的构造函数可以指定起始位置和长度，所以在同一段内存之中，可以依次生成不同类型的视图，这叫做“复合视图”。
```js
    const buffer = new ArrayBuffer(24);
    
    const idView = new Uint32Array(buffer, 0, 1);
    const usernameView = new Uint8Array(buffer, 4, 16);
    const amountDueView = new Float32Array(buffer, 20, 1);
```

二进制数组与字符串可以通过TextDecoder和TextEncoder来互相转换：
```js
    let uint8Array = new Uint8Array([72, 101, 108, 108, 111]);
    alert( new TextDecoder().decode(uint8Array) ); // Hello
    
    let uint8Array = new TextEncoder();.encode("Hello");
    alert( uint8Array ); // 72,101,108,108,111
```

### DataView
专为文件I/O和网络I/O设计，对缓冲数据有高度的控制，但比其他视图性能差一点。跟TypeArray不同，DataView视图中允许存在多种类型，并且可以声明数据的字节序。

```js
const buffer = new ArrayBuffer(4);

const view1 = new DataView(buffer);

// 在不同位置设置不同类型数字
view1.setInt8(0, 42); 
view1.setInt16(1, 22)

console.log(view1.getInt8(0)) // 42
console.log(view1.getInt16(1)) // 22
```

如果一次读取两个或两个以上字节，就必须明确数据的存储方式，到底是小端字节序还是大端字节序。默认情况下，DataView的get方法使用大端字节序解读数据;
```js
    // 小端字节序
    const v1 = dv.getUint16(1, true);
    
    // 大端字节序
    const v2 = dv.getUint16(3, false);
    
    // 大端字节序
    const v3 = dv.getUint16(3);
```

### Blob和ArratBuffer
- Blob实际上就是针对文件设计出来的对象，而ArratBuffer针对需要传输的数据本身；
- Blob主要解决媒体类型（MIME）的问题，ArratBuffer解决的是数据类型问题；
- Blob是浏览器的api，ArratBuffer数据JavaScript中的标准，ArratBuffer是更底层的API，可以直接操作内存；

### 二进制数组操作场景
- 与底层显卡/外部设备进行二进制数据交互；
- 利用SharedArrayBuffer在不同worker间共享内存（SharedArrayBuffer是ArrayBuffer的变体）
- ...

---

**如有错误，请务必留言告知，多谢～**

> 参考资料：\
> [为什么视频网站的视频链接地址是blob？](https://juejin.cn/post/6844903880774385671) \
> [聊聊JS的二进制家族：Blob、ArrayBuffer和Buffer](https://zhuanlan.zhihu.com/p/97768916) \
> [ECMAScript 6 入门](https://es6.ruanyifeng.com/#docs/arraybuffer)  \
> [理解字节序](https://www.ruanyifeng.com/blog/2016/11/byte-order.html) \
> [二进制数据，文件](https://zh.javascript.info/blob) \
> [JavaScript高级程序设计（第4版）](https://www.ituring.com.cn/book/2472)