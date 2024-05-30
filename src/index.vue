<template>
	<comp-sidebar v-if="!$hidden" ref="domSidebar" back-scheme="main" @contextmenu.self.prevent="emit('show-menu-background', $event)">
		<slot name="buttons-before" />
		<template v-for="group of groups" :key="group.id">
			<p-group-name v-if="group.id != 'default'" v-tip.right="group.text"
				:hidden="brop(hidden$idGroup[group.id])"
				:now="brop(hidden$idGroup[group.id] && group.tabs.find(({ tab }) => tabAdmin.now === tab))"
				@click="hidden$idGroup[group.id] = !hidden$idGroup[group.id]"
			>
				<span>{{ group.text }}</span>
				<span v-if="hidden$idGroup[group.id]" class="float-right">{{ hidden$idGroup[group.id] ? '+' : '' }}</span>
			</p-group-name>
			<template v-for="{ tab, index } of group.tabs" :key="tab.id">
				<p-tab
					v-show="!hidden$idGroup[group.id]"
					v-tip.right="tab.tipsTitle || tab.title"
					v-menu="{ params: tab, ...tab.option.menu }"
					:now="brop(tabAdmin.now === tab)"
					:tabindex="1000 + index"
					:style="tab.option.style"
					@click="tabAdmin.change(tab, 'switch-tab')"
					@keydown.enter.space="tabAdmin.change(tab, 'switch-tab-key')"
				>
					<template v-if="tab.typesTab.includes('icon-corn') && tab.icon">
						<Fas :icon="tab.icon" corn />
					</template>

					<template v-if="tab.typesTab.includes('icon') && tab.icon">
						<Fas :icon="tab.icon" />
					</template>

					<template v-if="tab.typesTab.includes('title') && tab.title">
						{{ tab.typesTab.includes('icon') ? ' ' : '' }}<p-title>{{ tab.title }}</p-title>
					</template>

					<template v-if="tab.typesTab.includes('header') && tab.header">
						<p-header :style="{ backgroundImage: `url(${tab.header})` }" />
					</template>
				</p-tab>
			</template>
		</template>
	</comp-sidebar>
</template>

<script>
import { ref, watch, inject, computed } from 'vue';
import { FontAwesomeIcon as Fas } from '@fortawesome/vue-fontawesome';

import { brop, bropBoolean } from '@nuogz/utility';

import TabAdmin from './tab-admin.js';

import './index.pcss';


export const tabAdmin = new TabAdmin();
export const moduleNow = ref(null);
export const domSidebar = ref(null);
export const hidden$idGroup = ref({});
</script>

<script setup>
const props = defineProps({
	/** （开关）隐藏 */
	hidden: { type: [Boolean, String], default: false },
});
const emit = defineEmits(['show-menu-background']);


const $hidden = computed(() => bropBoolean(props.hidden));


const modulePre = ref('');
watch(modulePre, inject('load-module')(moduleNow));

tabAdmin.modulePre = modulePre;


const app = inject('app');
const vTip = app.directive('tip') ?? {};
const vMenu = app.directive('menu') ?? {};


const groups = computed(() => {
	const groups = [{ id: 'default', text: '', showed: true, tabs: [] }];


	let groupNow = {};
	let index = 0;
	for(const tab of tabAdmin.list) {
		if(tab.option?.hidden) { continue; }


		let group = groupNow;
		if(!tab.group || !tab.group?.id) {
			group = groups[0];
		}
		else if(groupNow.id != tab.group?.id) {
			groups.push(group = groupNow = { id: tab.group.id, text: tab.group.text, showed: true, tabs: [] });
		}

		if(hidden$idGroup[group.id]) { continue; }


		group.tabs.push({ tab, index: index++ });
	}


	return groups.filter(group => group.tabs.length);
});
</script>

<style lang="sass" scoped>
comp-sidebar
	@apply fixed z-[500] shadow-sm shadow-[var(--cGray,GrayText)] px-2 overflow-x-hidden overflow-y-auto
	background-color: var(--cBackSideBar, var(--cBack, Canvas))
	width: var(--widthSidebar, 8rem)
	height: calc(100% - var(--heightTopbar, 0rem))
	top: var(--heightTopbar, 0rem)

	svg[corn]
		@apply absolute opacity-25 z-10 text-xs top-1 left-1

	p-group-name
		@apply relative block mt-4 mb-2 w-full text-sm cursor-pointer select-none
		color: var(--cGray, GrayText)
		&[hidden]
			color: var(--cTextBack, CanvasText)
		&[now]
			color: var(--cMain, AccentColor)

	p-tab
		@apply relative block h-8 px-2 mb-2 w-full
		@apply rounded-sm cursor-pointer select-none outline-none
		@apply shadow-sm shadow-[var(--cGray)]
		@apply elli text-left text-base leading-8
		color: var(--TextBack, CanvasText)
		background-color: var(--cBack, Canvas)

		&:first-of-type
			@apply mt-2

		&:focus
			@apply ring-2 ring-[var(--cRingFocus,GrayText)]

		&[profile]
			@apply font-bold mt-0

		&[expand]
			@apply overflow-hidden px-1

			&:focus-within
				@apply overflow-visible w-24 ring-2 ring-[var(--cRingFocus,GrayText)]

			input
				@apply rounded-sm w-full text-center outline-none z-20 bg-transparent

		&[keyword]:focus-within
			@apply w-48

		&[now]
			@apply ring-2 ring-[var(--cRingNow,AccentColor)]

		p-header
			@apply relative block rounded-sm shadow-sm shadow-[var(--cGray,GrayText)] absolute top-1 left-1
			@apply bg-center bg-contain bg-no-repeat
			width: calc(100% - 0.5rem)
			height: calc(100% - 0.5rem)
</style>
