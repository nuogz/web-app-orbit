import { reactive } from 'vue';
import { ulid } from 'ulidx';



/**
 * @typedef {Object} TabOption
 * @property {string} type type of how to show tab info in tab list
 * @property {string} typeList type of tab in tab list
 * @property {Object | Array<string> | string | import('@fortawesome/fontawesome-svg-core').IconDefinition} [icon] fontawesome icon (if typeList)
 * @property {string} [header] the url of tab image
 * @property {string} [title]
 * @property {string} [group] group name
 * @property {string} [tipsTitle] tips displayed on mouse hover
 * @property {boolean} [only]
 * @property {boolean} [hidden]
 * @property {boolean} [delay]
 * @property {Object} [style]
 * @property {import('@howdyjs/mouse-menu/dist/types').CustomMouseMenuOptions} [menu]
 */

export class Tab {
	/** @type {string} */
	id;
	/** @type {string} */
	module;
	/** @type {TabAdmin} */
	admin;

	/** @type {string} */
	typeTab;
	/** @type {string} */
	typeList;


	/** @type {TabOption} */
	option;


	/** @type {Object | Array<string> | string | import('@fortawesome/fontawesome-svg-core').IconDefinition} */
	icon;
	/** @type {string} */
	title;
	/** @type {string} */
	header;
	/** @type {string} */
	group;

	/** @type {string} */
	tipsTitle;


	/** @type {Object<string, any>} */
	info;

	/** @type {any[]} */
	params;
	/** @type {any[]} */
	paramsDelay;


	/** @type {boolean} */
	inited = false;



	/**
	 * @param {string} id
	 * @param {string} module
	 * @param {TabAdmin} admin
	 * @param {TabOption} [option={}]
	 * @param {any[]} [params=[]]
	 */
	constructor(id, module, admin, option = {}, params = []) {
		const { type = 'icon|title', typeList, icon, title, header, group, tipsTitle } = option;

		this.id = id;
		this.module = module;
		this.admin = admin;

		this.typeTab = type;
		this.typeList = typeList ?? module;

		this.option = option;

		this.icon = icon;
		this.title = title;
		this.header = header;
		this.group = group;
		this.tipsTitle = tipsTitle;

		this.info = {};
		this.params = params ?? {};
	}

	get typesTab() { return this.typeTab?.split('|') ?? []; }


	/**
	 * @param {string} [reason]
	 * @param {boolean} [withParams=false]
	 * @param {...any} params
	 */
	async changeToSelf(reason, withParams = false, ...params) {
		this.admin.change(this, reason, withParams, ...params);
	}
}

const sUseHandleInit = Symbol('use-handle-init');
export default class TabAdmin {
	static sUseHandleInit = sUseHandleInit;
	sUseHandleInit = sUseHandleInit;


	/** @type {Object<string, Tab>} */
	tabs$id = {};

	/** @type {string} */
	idTabNow = '';


	/** @type {Tab[]} */
	historiesTab = [];


	/** @type {import('vue').Ref<string>} */
	modulePre;


	/** @type {Tab} */
	get now() { return this.tabs$id[this.idTabNow]; }
	/** @type {Tab[]} */
	get list() { return Object.values(this.tabs$id); }



	constructor() { return reactive(this); }



	/**
	 * @param {string} module
	 * @param {TabOption} option
	 * @param {...any} params
	 * @returns {Tab}
	 */
	add(module, option = {}, ...params) {
		const idTab = ulid();


		const tab =
			(option.only ? Object.values(this.tabs$id).find(t => t.typeList == option.typeList) : undefined) ??
			(this.tabs$id[idTab] = new Tab(idTab, module, this, option));


		if(option.delay) {
			tab.paramsDelay = params;
		}
		else {
			this.change(tab, 'create-tab', true, ...params);
		}


		return tab;
	}

	/** @param {Tab} tab */
	del(tab) {
		const tabNow = this.now;

		const map = this.tabs$id;
		const ids = Object.keys(map);
		const index = ids.indexOf(tab.id);

		delete this.tabs$id[tab.id];


		if(tabNow === tab) {
			this.historiesTab.pop();
			const tabLast = this.historiesTab.pop();

			if(tabLast) {
				this.change(tabLast, 'remove-tab');
			}
			else {
				const tab = map[ids[index + 1] ?? ids[index - 1]];

				if(tab) { this.change(tab, 'remove-tab'); }
			}
		}

		this.historiesTab = this.historiesTab
			.filter(his => his !== tab)
			.filter((his, index, arr) => his !== arr[index - 1]);
	}

	/**
	 * @param {string} module
	 * @param {TabOption} option
	 * @param {...any} params
	 * @returns {Tab}
	 */
	changeOrAdd(module, option = {}, ...params) {
		const tab = this.list.find(tab => tab.module == module && (
			typeof option.handleFind == 'function'
				? option.handleFind(tab, this, module, option, ...params)
				: params.join('||') == (tab.params.join('||') || tab.paramsDelay?.join('||'))
		));


		if(tab) {
			this.change(tab, option.reason, Boolean(params.length), ...params);

			return tab;
		}

		return this.add(module, option, ...params);
	}

	/**
	 * @param {Tab} tab
	 * @param {string} [reason]
	 * @param {boolean} [withParams=false]
	 * @param {...any} params
	 */
	change(tab, reason, withParams = false, ...params) {
		if(this.idTabNow == tab.id) { return; }

		this.idTabNow = tab.id;
		this.modulePre = tab.module;


		if(this.historiesTab[this.historiesTab.length - 1] !== tab) { this.historiesTab.push(tab); }


		this.emitChanged(reason, withParams, ...params);
	}

	/**
	 * @param {string} [reason]
	 * @param {boolean} [withParams=false]
	 * @param {...any} params
	 */
	async emitChanged(reason, withParams = false, ...params) {
		const tabNow = this.now;

		if('paramsDelay' in tabNow) {
			tabNow.params = tabNow.paramsDelay;
			delete tabNow.paramsDelay;
		}
		if(withParams) { tabNow.params = params; }


		const handlesTab = this.handlesTab$typeList[tabNow.typeList];
		if(!handlesTab) { return; }


		for(const [refTab, handleInit, handleChange] of handlesTab) {
			try {
				refTab.value = tabNow;


				if(!tabNow.inited && typeof handleInit == 'function') {
					await handleInit(tabNow, reason);

					tabNow.inited = true;
				}
				else if(typeof handleChange == 'function') {
					await handleChange(tabNow, reason);
				}
				else if(handleChange === TabAdmin.sUseHandleInit) {
					await handleInit(tabNow, reason);
				}
			}
			catch(error) { globalThis.console.error('Occur error when emitting change tab.', error); }
		}
	}

	/**
	 * @typedef {Object} TabHandle
	 * @property {import('vue').Ref<Tab>} refTab
	 * @property {Function} handleInit
	 * @property {Function|Symbol} handleChange
	 */


	/** @type {Object<string, TabHandle[]>} */
	handlesTab$typeList = {};
	/**
	 * @param {string} typeListTab
	 * @param {import('vue').Ref<Tab>} refTab
	 * @param {Function} handleInit
	 * @param {Function} handleChange
	 */
	addTabHandle(typeListTab, refTab, handleInit, handleChange) {
		(this.handlesTab$typeList[typeListTab] ?? (this.handlesTab$typeList[typeListTab] = []))
			.push([refTab, handleInit, handleChange]);
	}
}
