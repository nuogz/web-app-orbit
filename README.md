> [!IMPORTANT]
> 本文档尚未完成，后续将提供机器翻译的英文版。\
> This document is not yet completed. A machine-translated English version will be provided later.

# @nuogz/web-app-orbit 天轨
![Version](https://img.shields.io/github/package-json/v/nuogz/web-app-orbit?style=flat-square)
![License](https://img.shields.io/github/license/nuogz/web-app-orbit?style=flat-square)

Bar component for framing main content in Nuogz Web App, based on [Vue 3](https://vuejs.org/).\
框住主内容的边栏组件，用于Nuogz Web App，基于Vue3、UnoCSS、Vue Router

环绕应用，也就是常见的侧/顶/底栏。四侧内容围着主内容，形似环绕天体。因而得名天轨。\
经过一系列的迭代，从原来的侧栏组件`vue-sidebar`升级重构为全新的`web-app-orbit`

基础示例：
````html
<AppOrbit mode="block">
  <!-- 顶栏slot -->
  <template #top>
    <span>Orbit Demo</span>
  </template>

  <!-- 左栏slot -->
  <template #left>
    <Navi v-for="menu of menus" @click="changeTo(menu)">
      {{ menu.title }}
    </Navi>
  </template>

  <!-- 主内容slot -->
  <template #main>
    <div>Hello Orbit!</div>
  </template>
</AppOrbit>
````

## DOM结构
使用天轨组件，会导致DOM结构产生变化：

非`none`模式，主内容会被一层`app-main`元素包裹，`app-moon`元素为各种边栏：
- body
  - app (index.vue)
    - app-moon[dirn=top]
    - app-moon[dirn=left]
    - app-moon[dirn=side][side=left]
    - **app-main**
      - (module.vue)
    - app-moon[dirn=side][side=right]
    - app-moon[dirn=right]
    - app-moon[dirn=bottom]
    - app-orbit-state (用于css选择器状态检测)

<details>
  <summary>碎碎念1</summary>
  orbit是围绕天体的轨道。moon是我们再熟悉不过的卫星——月亮。很好理解吧？<br>
  虽然它在我的组件中可能会有四颗……
</details><br>

`none`模式，DOM结构与原来保持一致，相当于禁用该组件：
- body
  - **app (index.vue)**
    - (module.vue)

## props 模板属性 
### mode 边栏模式
指定组件以哪种形式实现边栏功能。默认是`none`无边栏模式
````html
  <AppOrbit mode="border">...</AppOrbit>
````
- `none` **无边栏模式**\
  直接插入<主内容>，没有额外元素
- `border` **文档流模式**\
  边栏不脱离文档流，通过明确的宽高计算使主界面保持四个边栏的中间。\
  支持圆角边缘（需指定背景颜色）。滚动条在<主内容>侧边

计划支持但是搁置中的模式：
- `fixed` **视口固定模式**\
  边栏使用`position: fixed`脱离文档流，固定视口四侧中。主界面使用padding配合。\
  不支持圆角边缘。滚动条在视口侧边
- `fixed-nowrap` **视口固定模式（无包裹）**\
  边栏原理同`视口固定模式`，但<主内容>不使用`app-main`包裹，直接放置与app下

<details>
  <summary>碎碎念2</summary>
  本来视口固定模式开发得很顺利，但一加入边角的设计，复杂度直线上升<br>
  加上就我一个人对多种模式的需求很低，就先完成`border`就算了
</details>


### side 侧栏位置
`side`侧栏可以让开发者无需关注侧栏的左右位置，方便交由由用户自行控制。默认是`left`侧栏在左
````html
  <AppOrbit side="left">...</AppOrbit>
````
- `left` 侧栏在左
- `right` 侧栏在右

### corner 边角
当两个相邻的边栏同时生效时，两个边栏就会相交的边角产生重叠冲突。
`corner`就是为了解决由谁来使用边角而存在的\
该属性会影响视口的四角由哪个边栏占用的。默认是`x`侧栏优先\
支持数组、空格/逗号连接的字符串等多种定义形式
````html
  <AppOrbit corner="x">...</AppOrbit>
````
- `y` 顶栏和Y轴优先
- `x` 侧栏（左/右栏、X轴）优先
- `l` 左栏优先
- `r` 右栏优先

除预设值外，可以精确指定四角由谁占用，以顶栏、右栏为例，有以下三种传参方式：
````javascript
{ 'top-left': 'top', 'bottom-left': 'left' } // 对象
// 左上角由顶栏占用，左下角由左栏占用
['top', 'right'] // 数组
// 左上角由顶栏占用，右上角由右栏占用
'top top' // 字符串
// 左上角由顶栏占用，右上角由顶栏占用
````
数组、空格/逗号连接的字符串类型参数的键值顺序是:
- `top-left` 左上
- `top-right` 右上
- `bottom-left` 左下
- `bottom-right` 右下

### hide 隐藏侧栏
支持数组、空格/逗号连接的字符串等多种定义形式
````html
  <AppOrbit hide="top right">...</AppOrbit>
````
````javascript
// 以下均为隐藏顶栏、右栏
{ top: true, right: true } // 对象
['top', 'right'] // 数组
'top right' // 字符串
````
- `top` 上
- `right` 右
- `bottom` 下
- `left` 左
- `side` 侧
- `all` 全

## $state 状态
组件除了导出组件本身外，还导出是一个名为`$state`的Ref引用，方便用户侦听组件状态
````javascript
  import { $state } from '@nuogz/web-app-orbit';

  console.log($state.value.mode);
  // 'block' ==> block模式
  console.log($state.value.side);
  // 'left' ==> 侧栏在左


  console.log($stateOrbit.corner['top-left']);
  // 'top' ==> 左上角被顶栏占用
  console.log($stateOrbit.corner.top);
  // ['left', 'right'] ==> 顶栏占用了左上角与右上角


  console.log($state.value.moonsShowed);
  // ['top', 'side'] ==> 当前显示顶栏和侧栏
  console.log($state.value.dirnsShowed);
  // ['top', 'left'] ==> 当前<主内容>的上侧和左侧有边栏在显示
````
`moonsShowed`表达哪个边栏在显示\
`dirnsShowed`表达哪个方位有边栏在显示

## 样式控制
可通过覆盖一系列渐进的css变量，以达到控制边栏的外观

### 颜色变量
- `--app-orbit-back`\
边栏背景色\
默认值 `var(--main-solid)`
- `--app-orbit-back-text`\
边栏字体色\
默认值 `var(--contrast)`
- `--app-orbit-back`\
主内容背景色\
默认值 `var(--main-back)`

> 关于默认的颜色，请参阅NWA的主题颜色部分（仍未完成）

### 尺寸变量
尺寸边栏渐进的，表示范围越小的变量优先级越高

`top/bottom/left/right/side`是最终汇算应用的变量，
表示四侧边栏的宽度，默认值是`0`。
一般不推荐修改最终变量。

`t/l/r/b/x/y/a`分别表示`上/左/右/下/横轴/竖轴/全部`的精确变量。
均无默认值。推荐优先设置这些变量以保证优先级有效

`side`由于左右通用，因此`x`横轴变量优先级会比`l/r`左右两侧变量高

#### 汇算优先级
- `--app-orbit-top` 上
  - `var(--app-orbit-t)`
    - `var(--app-orbit-y)`
      - `var(--app-orbit-a)`
        - `0`
- `--app-orbit-left` 左
  - `var(--app-orbit-l)`
    - `var(--app-orbit-x)`
      - `var(--app-orbit-a)`
        - `0`
- `--app-orbit-right` 右
  - `var(--app-orbit-r)`
    - `var(--app-orbit-y)`
      - `var(--app-orbit-a)`
        - `0`
- `--app-orbit-bottom` 下
  - `var(--app-orbit-b)`
    - `var(--app-orbit-y)`
      - `var(--app-orbit-a)`
        - `0`
- `--app-orbit-side` 侧
  - `var(--app-orbit-x)`
    - `var(--app-orbit-left)`
        - `var(--app-orbit-right)`
          - `0`

## 父主元素`<app>`与`<app-main>`的样式控制
已知`none`模式与非`none`模式的dom结构并不一样，
包裹<主内容>的元素可能是`<app>`，也可能`<app>`下的`<app-main>`。\
同时在多模块环境下，还存在另一个问题：模块加载后全局样式会进入文档流。
但是当模块切换时，旧模块的全局样式并不会跟着卸载。\
为了简化选择父主元素，综合上述问题，利用侦听`mode`与vue-router的守卫函数进行了一些改造：

使得无论在哪个模式下，包括<主内容>的父主元素总是拥有属性`id="app"`和`route="当前路由"`（去除开头的`/`）。
用户可以根据这两个属性进行精确的元素选择，避免样式冲突

示例：

单文件全局样式
````html
<style lang="sass">
#app[route="demo/current-route-path"]
  @apply p-2 bg-blue-1
</style>
````
局部样式通过`:global`提升到全局
````html
<style lang="sass" scoped>
:global(#app[route="demo/current-route-path"])
  @apply p-2 bg-blue-1
</style>
````
如果是想只在用`none`模式或者明确只使用`none`模式
````html
<style lang="sass">
app:not(:has(app-main))[route="demo/current-route-path"]
  @apply p-2 bg-blue-1
</style>
````
