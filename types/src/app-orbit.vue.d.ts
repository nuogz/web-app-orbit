import { DefineComponent, Ref, VNode } from 'vue';



/** 天轨组件当前状态 */
export const $state: Ref<{
	mode: string;
	side: string;
	corner: {};
	hide: {};
	moonsShowed: {};
	dirnsShowed: string;
}>;




declare interface AppOrbitProps {
	/**
	 * ### 边栏模式
	 * 指定组件以哪种形式实现边栏功能。默认为`none`无边栏模式
	 * - `none` 无边栏模式：直接插入<模块>，没有额外元素
	 * - `border` 文档流模式：边栏不脱离文档流，通过宽高计算使主界面保持四个边栏的中间。支持圆角边缘（需指定背景颜色）
	 * - `fixed` （未发布）视口固定模式1：直接插入<模块>。边栏脱离文档流，使用`position: fixed`的固定视口的绝对位置中，主界面使用padding配合。不支持圆角边缘
	 * - `fixed-main` （未发布）视口固定模式2：边栏同`视口固定模式1`，但是使用`app-main`包裹<模块>
	 */
	mode?: 'border' | 'fixed' | 'fixed-main' | 'none',
	/**
	 * ### 侧栏位置
	 * `side`侧栏可以让开发者无需关注侧栏的左右位置。由用户自定义直接传入。默认为`left`侧栏在左
	 * #### 预设值
	 * - `left` 侧栏在左
	 * - `right` 侧栏在右
	 */
	side?: 'left' | 'right',
	/**
	 * ### 边角
	 * 影响视口的四角由哪个边栏占用，默认是端栏（顶/底栏、Y轴）优先。支持数组、空格/逗号连接的字符串
	 *
	 * #### 预设值
	 * - `y` 顶栏和Y轴优先
	 * - `x` 侧栏（左/右栏、X轴）优先
	 * - `l` 左栏优先
	 * - `r` 右栏优先
	 *
	 * 除预设值外，可以精确指定四角由谁占用，以顶栏、右栏为例，有以下三种传参方式：
	 * ````javascript
	 * { top-left: 'top', bottom-left: 'left' } // 对象
	 * // 左上角由顶栏占用，左下角由左栏占用
	 * ['top', 'right'] // 数组
	 * // 左上角由顶栏占用，右上角由右栏占用
	 * 'top top' // 字符串
	 * // 左上角由顶栏占用，右上角由顶栏占用
	 * ````
	 * 数组、空格/逗号连接的字符串类型参数的键值顺序是:
	 * - `top-left` 左上
	 * - `top-right` 右上
	 * - `bottom-left` 左下
	 * - `bottom-right` 右下
	 */
	corner: {
		'top-left': 'top' | 'left',
		'top-right': 'top' | 'right',
		'bottom-left': 'bottom' | 'left',
		'bottom-right': 'bottom' | 'right',
	} | string[] | string,
	/**
	 * ### 隐藏侧栏
	 * 支持数组、空格/逗号连接的字符串
	 *
	 * 以隐藏顶栏、右栏为例，有以下三种传参方式：
	 * ````javascript
	 * { top: true, right: true } // 对象
	 * ['top', 'right'] // 数组
	 * 'top right' // 字符串
	 * ````
	 *
	 * #### 预设值
	 * - `top` 上
	 * - `right` 右
	 * - `bottom` 下
	 * - `left` 左
	 * - `side` 侧
	 * - `all` 全
	 */
	hide: {
		top: boolean,
		right: boolean,
		bottom: boolean,
		left: boolean,
		side: boolean,
	} | string[] | string,
}

declare interface AppOrbitSlotsBindings {
	$slots: {
		/** 主内容插槽 */
		main: () => VNode[],

		/** 左栏插槽 */
		left?: () => VNode[],
		/** 右栏插槽 */
		right?: () => VNode[],
		/** 侧栏插槽 */
		side?: () => VNode[],

		/** 顶栏插槽 */
		top?: () => VNode[],
		/** 底栏插槽 */
		bottom?: () => VNode[],
	}
}



/** 天轨组件：环绕App主内容的固定栏位 */
declare const AppOrbit: DefineComponent<
	AppOrbitProps,
	AppOrbitSlotsBindings
>;



export default AppOrbit;
