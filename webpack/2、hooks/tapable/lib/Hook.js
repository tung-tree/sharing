/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const util = require("util");

const deprecateContext = util.deprecate(() => {},
"Hook.context is deprecated and will be removed");

const CALL_DELEGATE = function(...args) {
	this.call = this._createCall("sync");
	return this.call(...args); // this.compile 方法
};
const CALL_ASYNC_DELEGATE = function(...args) {
	this.callAsync = this._createCall("async");
	return this.callAsync(...args);
};
const PROMISE_DELEGATE = function(...args) {
	this.promise = this._createCall("promise");
	return this.promise(...args);
};

class Hook {
	constructor(args = [], name = undefined) {
		this._args = args;
		this.name = name;
		this.taps = [];
		this.interceptors = [];
		this._call = CALL_DELEGATE;
		this.call = CALL_DELEGATE;
		this._callAsync = CALL_ASYNC_DELEGATE;
		this.callAsync = CALL_ASYNC_DELEGATE;
		this._promise = PROMISE_DELEGATE;
		this.promise = PROMISE_DELEGATE;
		this._x = undefined;

		this.compile = this.compile;
		this.tap = this.tap;
		this.tapAsync = this.tapAsync;
		this.tapPromise = this.tapPromise;
	}

	compile(options) {
		throw new Error("Abstract: should be overridden");
	}

	_createCall(type) {
		return this.compile({
			taps: this.taps,
			interceptors: this.interceptors,
			args: this._args,
			type: type
		});
	}

	_tap(type, options, fn) {
		if (typeof options === "string") {
			options = {
				name: options.trim()
			};
		} else if (typeof options !== "object" || options === null) {
			throw new Error("Invalid tap options");
		}
		if (typeof options.name !== "string" || options.name === "") {
			throw new Error("Missing name for tap");
		}
		if (typeof options.context !== "undefined") {
			deprecateContext();
		}
		options = Object.assign({ type, fn }, options);
		options = this._runRegisterInterceptors(options);
		this._insert(options);
	}

	/**
	 * 执行tap
	 * @param {*} options 
	 * @param {*} fn 
	 */
	tap(options, fn) {
		this._tap("sync", options, fn);
	}

	tapAsync(options, fn) {
		this._tap("async", options, fn);
	}

	tapPromise(options, fn) {
		this._tap("promise", options, fn);
	}
	
	/**
	 * 拦截器
	 * @param {*} options 
	 */
	_runRegisterInterceptors(options) {
		for (const interceptor of this.interceptors) {
			if (interceptor.register) {
				const newOptions = interceptor.register(options);
				if (newOptions !== undefined) {
					options = newOptions;
				}
			}
		}
		return options;
	}

	withOptions(options) {
		const mergeOptions = opt =>
			Object.assign({}, options, typeof opt === "string" ? { name: opt } : opt);

		return {
			name: this.name,
			tap: (opt, fn) => this.tap(mergeOptions(opt), fn),
			tapAsync: (opt, fn) => this.tapAsync(mergeOptions(opt), fn),
			tapPromise: (opt, fn) => this.tapPromise(mergeOptions(opt), fn),
			intercept: interceptor => this.intercept(interceptor),
			isUsed: () => this.isUsed(),
			withOptions: opt => this.withOptions(mergeOptions(opt))
		};
	}

	isUsed() {
		return this.taps.length > 0 || this.interceptors.length > 0;
	}

	intercept(interceptor) {
		this._resetCompilation();
		this.interceptors.push(Object.assign({}, interceptor));
		if (interceptor.register) {
			for (let i = 0; i < this.taps.length; i++) {
				this.taps[i] = interceptor.register(this.taps[i]);
			}
		}
	}

	_resetCompilation() {
		this.call = this._call;
		this.callAsync = this._callAsync;
		this.promise = this._promise;
	}
	
	/**
	 * 
	 * 订阅 收集 handler
	 * 
	 * @param {*} item 就是 options
	 */
	_insert(item) {

		this._resetCompilation();

		let before;
		
		// 如果有 before 先保存
		// lisi
		if (typeof item.before === "string") {
			before = new Set([item.before]);
		} else if (Array.isArray(item.before)) {
			before = new Set(item.before);
		}

		let itemStage = 0;

		if (typeof item.stage === "number") {
			itemStage = item.stage;
		}

		let i = this.taps.length;

		// const index = this.taps.findIndex(option => option.name === item.before)
		// this.taps.splice(index,0,item)
		// O(n)
		
		while (i > 0) {
			i--; 
			const x = this.taps[i];
			this.taps[i + 1] = x;

			// stage 默认是 0
			const xStage = x.stage || 0;

			// 根据 before 排序
			// before : new Set (['lisi'])
			if (before) {
				// 如果一样，删除 name
				if (before.has(x.name)) {
					before.delete(x.name);
					continue;
				}
				// before : new Set (['lisi'])
				if (before.size > 0) {
					continue;
				}
			}
			
			// 根据 stage 排序 , stage 默认是 0 ，越大越靠后面
			if (xStage > itemStage) {
			  continue; // 每 continue 一次，i 就减少1，i 越小，表示插入的位置越靠前面
			}
			i++;
			break;
		}

		this.taps[i] = item;
	}
}

Object.setPrototypeOf(Hook.prototype, null);

module.exports = Hook;
