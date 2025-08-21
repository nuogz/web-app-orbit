<template>
	<template v-if="modesSome.includes($mode)">
		<app-moon v-if="$slotsShowed.top" dirn="top" :corner="$corner.moon.top"><slot name="top" /></app-moon>
		<app-moon v-if="$slotsShowed.left" dirn="left" :corner="$corner.moon.left"><slot name="left" /></app-moon>
		<app-moon v-if="$slotsShowed.side && $side == 'left'" dirn="side" :side="$side" :corner="$corner.moon.left"><slot name="side" /></app-moon>


		<app-main id="app" :dirns="$dirnsShowed.join(' ')" :route="route.path.replace(/^\//, '')"><slot name="main" /></app-main>
		<app-orbit-state :mode="$mode" :dirns="$dirnsShowed.join(' ')" />


		<app-moon v-if="$slotsShowed.side && $side == 'right'" dirn="side" :side="$side" :corner="$corner.moon.right"><slot name="side" /></app-moon>
		<app-moon v-if="$slotsShowed.right" dirn="right" :corner="$corner.moon.right"><slot name="right" /></app-moon>
		<app-moon v-if="$slotsShowed.bottom" dirn="bottom" :corner="$corner.moon.bottom" :top-compen="calcBorderBottomMoonTop($corner.corner)"><slot name="bottom" /></app-moon>
	</template>
	<template v-else>
		<slot name="main" />
	</template>
</template>

<script>
export const $state = ref({
	mode: '',
	side: '',
	corner: {},
	hide: {},

	moonsShowed: [],
	dirnsShowed: [],
});
</script>
<script setup>
import { computed, inject, ref, useSlots, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';



const props = defineProps({
	/**
	 * ### 边栏模式
	 * 指定组件以哪种形式实现边栏功能。默认为`none`无边栏模式
	 * - `none` 无边栏模式：直接插入<模块>，没有额外元素
	 * - `border` 文档流模式：边栏不脱离文档流，通过宽高计算使主界面保持四个边栏的中间。支持圆角边缘（需指定背景颜色）
	 * - `fixed` （未发布）视口固定模式1：直接插入<模块>。边栏脱离文档流，使用`position: fixed`的固定视口的绝对位置中，主界面使用padding配合。不支持圆角边缘
	 * - `fixed-main` （未发布）视口固定模式2：边栏同`视口固定模式1`，但是使用`app-main`包裹<模块>
	 * @type {string}
	 */
	mode: { type: String, default: 'none' },
	/**
	 * ### 侧栏位置
	 * `side`侧栏可以让开发者无需关注侧栏的左右位置。由用户自定义直接传入。默认为`left`侧栏在左
	 * #### 预设值
	 * - `left` 侧栏在左
	 * - `right` 侧栏在右
	 * @type {string}
	 */
	side: { type: String, default: 'left' },
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
	 *
	 * @type {{ 'top-left': 'top'|'left', 'top-right': 'top'|'right', 'bottom-left': 'bottom'|'left', 'bottom-right': 'bottom'|'right' }|string[]|string}
	 */
	corner: { type: [Object, Array, String], default: 'x' },
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
	 * @type {{ top: boolean, right: boolean, bottom: boolean, left: boolean, side: boolean }|string[]|string}
	 */
	hide: { type: [Object, Array, String], default: () => ({}) },
});

const modesSome = ['border', 'fixed', 'fixed-main'];
const $mode = computed(() => props.mode ? String(props.mode).toLowerCase() : 'none');

const valueDefaultCorner = Object.freeze({
	moon: Object.freeze({ top: 'left right', bottom: 'left right' }),
	corner: Object.freeze({ 'top-left': 'top', 'top-right': 'top', 'bottom-left': 'bottom', 'bottom-right': 'bottom' }),
});
const valuesPresetCorner = {
	y: { 'top-left': 'top', 'top-right': 'top', 'bottom-left': 'bottom', 'bottom-right': 'bottom' },
	x: { 'top-left': 'left', 'top-right': 'right', 'bottom-left': 'left', 'bottom-right': 'right' },
	l: { 'top-left': 'left', 'top-right': 'top', 'bottom-left': 'left', 'bottom-right': 'bottom' },
	r: { 'top-left': 'top ', 'top-right': 'right', 'bottom-left': 'bottom', 'bottom-right': 'right' },
};
const $corner = computed(() => {
	const dirns = $dirnsShowed.value;

	let raws = props.corner;

	if(raws in valuesPresetCorner) { raws = valuesPresetCorner[raws]; }


	if(typeof raws == 'string') { raws = raws.trim().split(/ |,/).map(r => r.trim()); }


	let result;
	if(typeof raws == 'object') {
		let cornerTL, cornerTR, cornerBL, cornerBR;

		if(raws instanceof Array) {
			[cornerTL, cornerTR, cornerBL, cornerBR] = raws.map(raw => String(raw).toLowerCase());
		}
		else if(raws) {
			cornerTL = String(raws['top-left']).toLowerCase();
			cornerTR = String(raws['top-right']).toLowerCase();
			cornerBL = String(raws['bottom-left']).toLowerCase();
			cornerBR = String(raws['bottom-right']).toLowerCase();
		}


		const cornerRaws = {
			'top-left': cornerTL == 'top' || cornerTL == 'left' ? cornerTL : undefined,
			'top-right': cornerTR == 'top' || cornerTR == 'right' ? cornerTR : undefined,
			'bottom-left': cornerBL == 'bottom' || cornerBL == 'left' ? cornerBL : undefined,
			'bottom-right': cornerBR == 'bottom' || cornerBR == 'right' ? cornerBR : undefined,
		};
		for(const key in cornerRaws) { if(cornerRaws[key] === undefined) { delete cornerRaws[key]; } }

		const cornerDirn = {
			'top-left': dirns.includes('top') && dirns.includes('left') ? undefined :
				dirns.includes('top') && !dirns.includes('left') ? 'top' :
					!dirns.includes('top') && dirns.includes('left') ? 'left' :
						false,
			'top-right': dirns.includes('top') && dirns.includes('right') ? undefined :
				dirns.includes('top') && !dirns.includes('right') ? 'top' :
					!dirns.includes('top') && dirns.includes('right') ? 'right' :
						false,
			'bottom-left': dirns.includes('bottom') && dirns.includes('left') ? undefined :
				dirns.includes('bottom') && !dirns.includes('left') ? 'bottom' :
					!dirns.includes('bottom') && dirns.includes('left') ? 'left' :
						false,
			'bottom-right': dirns.includes('bottom') && dirns.includes('right') ? undefined :
				dirns.includes('bottom') && !dirns.includes('right') ? 'bottom' :
					!dirns.includes('bottom') && dirns.includes('right') ? 'right' :
						false,
		};
		for(const key in cornerDirn) { if(cornerDirn[key] === undefined) { delete cornerDirn[key]; } }

		const corner = Object.assign({}, valueDefaultCorner.corner, cornerRaws, cornerDirn);

		result = {
			moon: Object.assign({}, {
				top: [
					corner['top-left'] == 'top' ? 'left' : null,
					corner['top-right'] == 'top' ? 'right' : null
				].filter(c => c).join(' ') || undefined,
				left: [
					corner['top-left'] == 'left' ? 'top' : null,
					corner['bottom-left'] == 'left' ? 'bottom' : null
				].filter(c => c).join(' ') || undefined,
				bottom: [
					corner['bottom-left'] == 'bottom' ? 'left' : null,
					corner['bottom-right'] == 'bottom' ? 'right' : null
				].filter(c => c).join(' ') || undefined,
				right: [
					corner['top-right'] == 'right' ? 'top' : null,
					corner['bottom-right'] == 'right' ? 'bottom' : null
				].filter(c => c).join(' ') || undefined,
			}),
			corner
		};
	}
	else {
		throw Error('<app-orbit> prop "hide" must be string, array or object');
	}

	return result;
});

const $side = computed(() => props.side ? String(props.side).toLowerCase() : 'left');

const $hide = computed(() => {
	let raws = props.hide;

	if(typeof raws == 'string') { raws = raws.trim().split(/ |,/).map(r => r.trim()).filter(r => r); }


	let result;
	if(raws instanceof Array) {
		raws = raws.map(raw => String(raw).toLowerCase());

		result = {
			top: raws.includes('all') || raws.includes('top'),
			right: raws.includes('all') || raws.includes('right'),
			bottom: raws.includes('all') || raws.includes('bottom'),
			left: raws.includes('all') || raws.includes('left'),
			side: raws.includes('all') || raws.includes('side'),
		};
	}
	else if(raws) {
		result = {
			top: Boolean(raws.top),
			right: Boolean(raws.right),
			bottom: Boolean(raws.bottom),
			left: Boolean(raws.left),
			side: Boolean(raws.side),
		};
	}
	else {
		throw Error('<app-orbit> prop "hide" must be string, array or object');
	}

	return result;
});

const $slots = useSlots();
const $slotsShowed = computed(() => {
	const hide = $hide.value;

	const result = {};

	if($slots.top && !hide.top) { result.top = $slots.top; }
	if($slots.bottom && !hide.bottom) { result.bottom = $slots.bottom; }
	if($slots.left && !hide.left) { result.left = $slots.left; }
	if($slots.right && !hide.right) { result.right = $slots.right; }
	if(!result.left && !result.right &&
		$slots.side && !hide.side) { result.side = $slots.side; }

	return result;
});
const $dirnsShowed = computed(() => {
	const slotsShowed = $slotsShowed.value;

	return [
		slotsShowed.top ? 'top' : '',
		slotsShowed.left || (slotsShowed.side && $side.value == 'left') ? 'left' : '',
		slotsShowed.right || (slotsShowed.side && $side.value == 'right') ? 'right' : '',
		slotsShowed.bottom ? 'bottom' : '',
		slotsShowed.side ? 'side' : '',
	].filter(s => s);
});


/** `border`模式下，底栏的top值补偿计算 */
const calcBorderBottomMoonTop = corner => {
	const countTL = ~~(corner['top-left'] == 'left');
	const countTR = ~~(corner['top-right'] == 'right');
	const countBL = ~~(corner['bottom-left'] == 'left');
	const countBR = ~~(corner['bottom-right'] == 'right');

	const countT = countTL + countTR;
	const countB = countBL + countBR;
	const countAll = countT + countB;

	// 3
	if(countAll >= 3) { return 'tb'; }
	// y-2
	if(countTL == 1 && countBL == 1) { return 'tb'; }
	if(countTR == 1 && countBR == 1) { return 'tb'; }

	// 1 和 x-2
	if((countT == 1 || countT == 2) && countB == 0) { return 't'; }
	if((countB == 1 || countB == 2) && countT == 0) { return 'b'; }

	// 对角-2
	if(countTL == 1 && countBR == 1) { return 'b'; }
	if(countTR == 1 && countBL == 1) { return 'b'; }
};


watchEffect(() => $state.value.mode = $mode.value);
watchEffect(() => $state.value.side = $side.value);
watchEffect(() => {
	const moon = $corner.value.moon;

	$state.value.corner = {
		top: moon.top ? moon.top.split(' ') : [],
		left: moon.left ? moon.left.split(' ') : [],
		bottom: moon.bottom ? moon.bottom.split(' ') : [],
		right: moon.right ? moon.right.split(' ') : [],
		...$corner.value.corner,
	};
});
watchEffect(() => $state.value.hide = $hide.value);
watchEffect(() => $state.value.moonsShowed = Object.keys($slotsShowed.value));
watchEffect(() => $state.value.dirnsShowed = $dirnsShowed.value);


/** @type {HTMLElement} */
const elApp = inject('elApp');
const route = useRoute();
watch($mode, mode => {
	if(mode == 'border') {
		elApp.removeAttribute('id');
		elApp.removeAttribute('route');
	}
	else if(mode == 'none') {
		elApp.setAttribute('id', 'app');
		elApp.setAttribute('route', route.path.replace(/^\//, ''));
	}
});

const router = useRouter();
router.beforeEach(routeTo => {
	const elAppMain = document.querySelector('#app');

	elAppMain?.setAttribute('route', routeTo.path.replace(/^\//, ''));
});
</script>

<style lang="sass">
app-orbit-state
	@apply hidden

app:has(>app-orbit-state[mode])
	--app-orbit-top: var(--app-orbit-t, var(--app-orbit-y, var(--app-orbit-a, 0)))
	--app-orbit-left: var(--app-orbit-l, var(--app-orbit-x, var(--app-orbit-a, 0)))
	--app-orbit-right: var(--app-orbit-r, var(--app-orbit-x, var(--app-orbit-a, 0)))
	--app-orbit-bottom: var(--app-orbit-b, var(--app-orbit-y, var(--app-orbit-a, 0)))
	--app-orbit-side: var(--app-orbit-x, var(--app-orbit-left, var(--app-orbit-right, 0)))

	--app-orbit-back: var(--main-solid)
	--app-orbit-back-text: var(--contrast)
	--app-orbit-main: var(--main-back)

app:has(>app-orbit-state[mode=border])
	background-color: var(--app-orbit-back)
	@apply block relative w-[100vw] h-[100vh] overflow-hidden

	&:not(:has([dirns~=top]))
		--app-orbit-top: 0rem
	&:not(:has([dirns~=bottom]))
		--app-orbit-bottom: 0rem
	&:not(:has([dirns~=left]))
		--app-orbit-left: 0rem
	&:not(:has([dirns~=right]))
		--app-orbit-right: 0rem

	app-moon
		@apply relative overflow-auto
		background-color: var(--app-orbit-back)
		color: var(--app-orbit-back-text)

		// dirn=y
		&[dirn=top], &[dirn=bottom]
			@apply block

			left: var(--app-orbit-left)
			width: calc(100% - var(--app-orbit-left) - var(--app-orbit-right))
			&[corner~=left]:not([corner~=right])
				left: 0
				width: calc(100% - var(--app-orbit-right))
			&[corner~=right]:not([corner~=left])
				width: calc(100% - var(--app-orbit-left))
			&[corner~=right][corner~=left]
				left: 0
				width: 100%

		&[dirn=top]
			height: var(--app-orbit-top)
			line-height: var(--app-orbit-top)
		&[dirn=bottom]
			height: var(--app-orbit-bottom)
			line-height: var(--app-orbit-bottom)

			&[top-compen=t]
				top: calc(var(--app-orbit-top) * -1)
			&[top-compen=b]
				top: calc(var(--app-orbit-bottom) * -1)
			&[top-compen=tb]
				top: calc((var(--app-orbit-top) + var(--app-orbit-bottom)) * -1)

		// dirn=x
		&[dirn=left], &[dirn=right], &[dirn=side]
			@apply inblock
			height: calc(100% - var(--app-orbit-top) - var(--app-orbit-bottom))

			top: 0
			&[corner~=top]:not([corner~=bottom])
				top: calc(var(--app-orbit-top) * -1)
				height: calc(100% - var(--app-orbit-bottom))
			&[corner~=bottom]:not([corner~=top])
				height: calc(100% - var(--app-orbit-top))
			&[corner~=bottom][corner~=top]
				top: calc(var(--app-orbit-top) * -1)
				height: 100%
		&[dirn=left]
			width: var(--app-orbit-left)
		&[dirn=right]
			width: var(--app-orbit-right)
		&[dirn=side]
			width: var(--app-orbit-side)

	app-main
		@apply inblock relative overflow-auto
		background-color: var(--app-orbit-main)

		width: 100%
		&[dirns~=left]
			width: calc(100% - var(--app-orbit-left))
		&[dirns~=right]
			width: calc(100% - var(--app-orbit-right))
		&[dirns~=left][dirns~=right]
			width: calc(100% - var(--app-orbit-left) - var(--app-orbit-right))
		&[dirns~=side]
			width: calc(100% - var(--app-orbit-side))

		height: 100%
		&[dirns~=top]
			height: calc(100% - var(--app-orbit-top))
		&[dirns~=bottom]
			height: calc(100% - var(--app-orbit-bottom))
		&[dirns~=top][dirns~=bottom]
			height: calc(100% - var(--app-orbit-top) - var(--app-orbit-bottom))

		&[dirns~=top][dirns~=left]
			@apply rounded-tl-lg
		&[dirns~=top][dirns~=right]
			@apply rounded-tr-lg
		&[dirns~=bottom][dirns~=left]
			@apply rounded-bl-lg
		&[dirns~=bottom][dirns~=right]
			@apply rounded-br-lg
</style>
