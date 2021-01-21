/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var fs = require("fs");
var readFile = fs.readFile.bind(fs);
var loadLoader = require("./loadLoader");

function utf8BufferToString(buf) {
	var str = buf.toString("utf-8");
	if(str.charCodeAt(0) === 0xFEFF) {
		return str.substr(1);
	} else {
		return str;
	}
}

const PATH_QUERY_FRAGMENT_REGEXP = /^((?:\0.|[^?#\0])*)(\?(?:\0.|[^#\0])*)?(#.*)?$/;

/**
 * @param {string} str the path with query and fragment
 * @returns {{ path: string, query: string, fragment: string }} parsed parts
 */
function parsePathQueryFragment(str) {
	var match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
	return {
		path: match[1].replace(/\0(.)/g, "$1"),
		query: match[2] ? match[2].replace(/\0(.)/g, "$1") : "",
		fragment: match[3] || ""
	};
}

function dirname(path) {
	if(path === "/") return "/";
	var i = path.lastIndexOf("/");
	var j = path.lastIndexOf("\\");
	var i2 = path.indexOf("/");
	var j2 = path.indexOf("\\");
	var idx = i > j ? i : j;
	var idx2 = i > j ? i2 : j2;
	if(idx < 0) return path;
	if(idx === idx2) return path.substr(0, idx + 1);
	return path.substr(0, idx);
}

function createLoaderObject(loader) {
	var obj = {
		path: null,
		query: null,
		fragment: null,
		options: null,
		ident: null,
		normal: null, // loader 函数
		pitch: null,  // loader.pitch 函数
		raw: null,    // 返回 string 还是 Buffer
		data: null,   
		pitchExecuted: false,
		normalExecuted: false
	};

	Object.defineProperty(obj, "request", {
		enumerable: true,
		get: function() {
			return obj.path.replace(/#/g, "\0#") + obj.query.replace(/#/g, "\0#") + obj.fragment;
		},
		set: function(value) {
            /**
			 * 
			 * loader.js?a=1&b=2#123
			 * loader 也有 path ,  query , fragment
			 * 
			 */
			if(typeof value === "string") {
				var splittedRequest = parsePathQueryFragment(value);
				obj.path = splittedRequest.path;
				obj.query = splittedRequest.query;
				obj.fragment = splittedRequest.fragment;
				obj.options = undefined;
				obj.ident = undefined;
			} else {

               /**
				 * 
				 * {
				 *   loader:'./xxx/xxx/loader.js'
				 *   options: {...}
				 * }
				 * 
				 * 
				 */
				if(!value.loader)
					throw new Error("request should be a string or object with loader and options (" + JSON.stringify(value) + ")");
				obj.path = value.loader;
				obj.fragment = value.fragment || "";
				obj.type = value.type;
				obj.options = value.options;
				obj.ident = value.ident;
				if(obj.options === null)
					obj.query = "";
				else if(obj.options === undefined)
					obj.query = "";
				else if(typeof obj.options === "string")
					obj.query = "?" + obj.options;
				else if(obj.ident)
					obj.query = "??" + obj.ident;
				else if(typeof obj.options === "object" && obj.options.ident)
					obj.query = "??" + obj.options.ident;
				else
					obj.query = "?" + JSON.stringify(obj.options);
			}
		}
	});

	// 这里赋值，会执行 Object.defineProperty(obj, "request",{...})
	// 给 obj 的下的属性赋值
	obj.request = loader;

	if(Object.preventExtensions) {
		Object.preventExtensions(obj);
	}
	return obj;
}



/**
 *  情况一：执行 pitch 方法的时候调用
 *  情况二：执行 loader 函数的的时候调用
 * 
 * @param {*} fn  可能是 pitch , 也可能是 loader
 * @param {*} context 
 * @param {*} args 
 * @param {*} callback pitch normal 执行结果后的回调
 */
function runSyncOrAsync(fn, context, args, callback) {
	// 默认同步表示
	var isSync = true;
	// 默认loader没有执行
	var isDone = false;
	var isError = false; // internal error
	var reportedError = false;
	
	// context 就是 loader 中的 this
	// 把 isSync 改成了 false (同步改成了异步的标识)
	context.async = function async() {
		if(isDone) {
			if(reportedError) return; // ignore
			throw new Error("async(): The callback was already called.");
		}
		// 同步改成异步
		isSync = false;
		return innerCallback;
	};
	
	/**
	 *  
	 * 采用执行回调的方式
	 * 
	 * function loader (){
	 *     // 情况一：异步调用
	 *     const cb = this.async
	 *     cb()
	 * 
	 *
	 *     // 情况二：同步调用
	 *     const cb = this.callback()
	 *     cb()
	 *   
	 *  }
	 * 
	 * 
	 * 
	 */
	var innerCallback = context.callback = function() {
		if(isDone) {
			if(reportedError) return; // ignore
			throw new Error("callback(): The callback was already called.");
		}
		isDone = true;
		isSync = false;
		try {
			callback.apply(null, arguments);
		} catch(e) {
			isError = true;
			throw e;
		}
	};


	try {
		/**
		 * 
		 *  采用 直接 return 的方式
		 * 
		*  function loader (){
		*     // 情况三：直接使用 return 
		*     return source
		*  }
		* 
		* 
		*/
		var result = (function LOADER_EXECUTION() {
			return fn.apply(context, args);
		}());

		if(isSync) {
			isDone = true;
			if(result === undefined)
				return callback();
		    // 如果返回的是 promise
			if(result && typeof result === "object" && typeof result.then === "function") {
				return result.then(function(r) {
					callback(null, r);
				}, callback);
			}

			return callback(null, result);
		}
	} catch(e) {
		if(isError) throw e;
		if(isDone) {
			// loader is already "done", so we cannot use the callback function
			// for better debugging we print the error on the console
			if(typeof e === "object" && e.stack) console.error(e.stack);
			else console.error(e);
			return;
		}
		isDone = true;
		reportedError = true;
		callback(e);
	}

}

function convertArgs(args, raw) {
	// args[0] 是读取的资源
	if(!raw && Buffer.isBuffer(args[0]))
	    // 如果 raw 不是 true ，并且  args[0] 是 Buffer 就转换成 string
		args[0] = utf8BufferToString(args[0]);
	else if(raw && typeof args[0] === "string")
	    // 如果 raw 是 true , 并且 args[0] 是 string 就转换成 Buffer
		args[0] = Buffer.from(args[0], "utf-8");
}


/**
 * 迭代 loader pitch
 * @param {*} options 
 * @param {*} loaderContext 
 * @param {*} callback 
 */
function iteratePitchingLoaders(options, loaderContext, callback) {

	// loaders 的 pitch 都已经执行完毕 ， 就加载 resource 资源
	if(loaderContext.loaderIndex >= loaderContext.loaders.length)
		return processResource(options, loaderContext, callback);
	
    // 取出当前 loader object		
	var currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

	// 如果 当前 loader object 已经执行就继续 迭代下个 loader pitch		
	if(currentLoaderObject.pitchExecuted) {
		// 下个 loader
		loaderContext.loaderIndex++;
		return iteratePitchingLoaders(options, loaderContext, callback);
	}
	
	// load loader module
	loadLoader(currentLoaderObject, function(err) {
		if(err) {
			loaderContext.cacheable(false);
			return callback(err);
		}
	 
		/**
		 *  注意不是每个 loader 都有 pitch
		 */
		var fn = currentLoaderObject.pitch;

		currentLoaderObject.pitchExecuted = true;


		/**
		* 
		*   没有 pitch 方法，就继续迭代
		*   
	    *   呼应这段代码
		* 
		* 	if(currentLoaderObject.pitchExecuted) {
		*		loaderContext.loaderIndex++;
		*		return iteratePitchingLoaders(options, loaderContext, callback);
		*	}
		* 
		*/
		if(!fn) return iteratePitchingLoaders(options, loaderContext, callback);


		/**
		 * 
		 * pitch 与 normal 的统一执行入口
		 * 
		 */
		runSyncOrAsync(
			fn,
			loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}],
			function(err) {

				if(err) return callback(err);
				
				// 干掉第一个参数，带一个参数是 err
				var args = Array.prototype.slice.call(arguments, 1);

				// Determine whether to continue the pitching process based on
				// argument values (as opposed to argument presence) in order
				// to support synchronous and asynchronous usages.
				
				// 获取 pitch 返回不是 undefined 的参数
				var hasArg = args.some(function(value) {
					return value !== undefined;
				});

				if(hasArg) {
					// 如果 pitch 返回了 非 undefined 值
					// 首先 loaderIndex - 1
					loaderContext.loaderIndex--;
					// 开始迭代 loader normal 
					// 注意：是拿到 pitch 的返回结果 给 normal
					iterateNormalLoaders(options, loaderContext, args, callback);
				} else {
					// 如果 pitch 返回了 undefined 
					// 继续 遍历 下个 loader pitch
					iteratePitchingLoaders(options, loaderContext, callback);
				}
			}
		);
	});
}

/**
 * 读取资源
 * @param {*} options 
 * @param {*} loaderContext 
 * @param {*} callback 
 */
function processResource(options, loaderContext, callback) {

	// 读取要转换的资源之前，保证 loaderIndex 是 loader 最后一个 loader
	loaderContext.loaderIndex = loaderContext.loaders.length - 1;

	// 拿到 资源 path
	var resourcePath = loaderContext.resourcePath;

	if(resourcePath) {
        /**
		 *     
		 *      读取资源 , 入口定义的
		 *   	var processResource = options.processResource || ((readResource, context, resource, callback) => {
		 *			context.addDependency(resource);
		 *			readResource(resource, callback); // readResource 其实就是 fs
		 *		}).bind(null, options.readResource || readFile);
		 * 
		 * */		
		options.processResource(loaderContext, resourcePath, function(err, buffer) {
			if(err) return callback(err);
			options.resourceBuffer = buffer;
			// 读取资源之后，继续 loader normal 迭代
			iterateNormalLoaders(options, loaderContext, [buffer], callback);
		});
	} else {
		iterateNormalLoaders(options, loaderContext, [null], callback);
	}
}


/**
 * 迭代 loader
 * 
 * args 内容有两种情况：
 * 
 * 1、可能是资源内容
 * 
 * 2、可能是 pitch 返回的类容
 * 
 * @param {*} options 
 * @param {*} loaderContext 
 * @param {*} args     // 就是 资源内容
 * @param {*} callback 
 */
function iterateNormalLoaders(options, loaderContext, args, callback) {
	if(loaderContext.loaderIndex < 0)
		return callback(null, args);
	
    // 拿到当前 loader 的 object
	var currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

	// 判断 currentLoaderObject.normal 是否执行
	if(currentLoaderObject.normalExecuted) {
		loaderContext.loaderIndex--;
		return iterateNormalLoaders(options, loaderContext, args, callback);
	}

	var fn = currentLoaderObject.normal;

	currentLoaderObject.normalExecuted = true;

	if(!fn) {
		return iterateNormalLoaders(options, loaderContext, args, callback);
	}
	
	/**
	 * 
	 * 根据 raw 的值，string 与 buffer 互转
	 * 
	 */
	convertArgs(args, currentLoaderObject.raw);

	/**
	 * 
	 * 
	 */

	runSyncOrAsync(fn, loaderContext, args, function(err) {
		if(err) return callback(err);

		var args = Array.prototype.slice.call(arguments, 1);
		iterateNormalLoaders(options, loaderContext, args, callback);
	});
}

exports.getContext = function getContext(resource) {
	var path = parsePathQueryFragment(resource).path;
	return dirname(path);
};

exports.runLoaders = function runLoaders(options, callback) {
	// 要转换的资源路径
	var resource = options.resource || "";

	// 处理资源的 loader path 数组
	var loaders = options.loaders || [];

	// 处理资源的上下文参数
	var loaderContext = options.context || {};

	// 真正读取转换资源的函数
	var processResource = options.processResource || ((readResource, context, resource, callback) => {
		context.addDependency(resource);
		readResource(resource, callback);
	}).bind(null, options.readResource || readFile);

	// 解析资源 path 
	// ./src/xxxx.js?a=123#yyyy
	var splittedResource = resource && parsePathQueryFragment(resource);

	// 转换资源的path 如：./src/xxxx.js
	var resourcePath = splittedResource ? splittedResource.path : undefined;

	// 转换资源的 query 如 ：?a=123
	var resourceQuery = splittedResource ? splittedResource.query : undefined;

	// 转换资源的锚点 如：#yyy
	var resourceFragment = splittedResource ? splittedResource.fragment : undefined;
 
	//  转换资源的目录 如：src
	var contextDirectory = resourcePath ? dirname(resourcePath) : null;

	// execution state
	var requestCacheable = true;
	var fileDependencies = [];
	var contextDependencies = [];
	var missingDependencies = [];

	/**
	 * 
	 * loaders : [
	 *    '/Users/yanpingli/learn/sharing/webpack/3、loader/loader/style-loader',
	 *    '/Users/yanpingli/learn/sharing/webpack/3、loader/loader/less-loader'
	 * ]
	 * 
	 * 处理之后
	 * 
	 * loaders:[ styleLoaderObject , lessLoaderObject]
	 * 
	 */
	loaders = loaders.map(createLoaderObject);

	loaderContext.context = contextDirectory;

	/**
	 * 
	 * 当前执行loader的下标，这个属性特别重要
	 * 
	 * 后续遍历 loader , pitch 就根据他来的
	 * 
	 */
	loaderContext.loaderIndex = 0;

	/**
	 * 
	 * loaderObject 数组
	 * 
	 * loaders:[loaderObject1,loaderObject2,....]
	 * 
	 */
	loaderContext.loaders = loaders; 

	loaderContext.resourcePath = resourcePath;

	loaderContext.resourceQuery = resourceQuery;

	loaderContext.resourceFragment = resourceFragment;

	/**
	 * 
	 * loader 函数里面 ， this.async 就它 ， 异步
	 * 
	 */
	loaderContext.async = null;

	/**
	 * 
	 * loader 函数里面 ， this.callback 就它 ， 同步
	 * 
	 */	
	loaderContext.callback = null;

	loaderContext.cacheable = function cacheable(flag) {
		if(flag === false) {
			requestCacheable = false;
		}
	};

	loaderContext.dependency = loaderContext.addDependency = function addDependency(file) {
		fileDependencies.push(file);
	};

	loaderContext.addContextDependency = function addContextDependency(context) {
		contextDependencies.push(context);
	};
	loaderContext.addMissingDependency = function addMissingDependency(context) {
		missingDependencies.push(context);
	};
	loaderContext.getDependencies = function getDependencies() {
		return fileDependencies.slice();
	};
	loaderContext.getContextDependencies = function getContextDependencies() {
		return contextDependencies.slice();
	};
	loaderContext.getMissingDependencies = function getMissingDependencies() {
		return missingDependencies.slice();
	};
	loaderContext.clearDependencies = function clearDependencies() {
		fileDependencies.length = 0;
		contextDependencies.length = 0;
		missingDependencies.length = 0;
		requestCacheable = true;
	};
	
    /**
	 * 当前资源的 绝对路径
	 * 
	 * 
	 * 
	 */
	Object.defineProperty(loaderContext, "resource", {
		enumerable: true,
		get: function() {
			if(loaderContext.resourcePath === undefined)
				return undefined;
			return loaderContext.resourcePath.replace(/#/g, "\0#") + loaderContext.resourceQuery.replace(/#/g, "\0#") + loaderContext.resourceFragment;
		},
		set: function(value) {
			var splittedResource = value && parsePathQueryFragment(value);
			loaderContext.resourcePath = splittedResource ? splittedResource.path : undefined;
			loaderContext.resourceQuery = splittedResource ? splittedResource.query : undefined;
			loaderContext.resourceFragment = splittedResource ? splittedResource.fragment : undefined;
		}
	});


    /**
	 * 
	 * 比如：
	 * 
	 * resource: './src/index.js'
	 * loaders:['loader1.js','loader2.js','loader3.js']
	 * 
	 * 那么： loaderContext.request 如下：
	 * 
	 * 
	 * loader1.js!loader2.js!loader3.js!./src/index.js
	 * 
	 * 
	 * 表示当前 ./src/index.js 要经过 loader1.js、loader2.js、loader3.js 转换处理
	 */

	Object.defineProperty(loaderContext, "request", {
		enumerable: true,
		get: function() {
			return loaderContext.loaders.map(function(o) {
				return o.request;
			}).concat(loaderContext.resource || "").join("!");
		}
	});

	/**
	 * 
	 *  如果当前 loaderIndex 是 1 （loader2.js）
	 * 
	 *  剩余 loader 的 路径是
	 * 
	 *  loader3.js!./src/index.js
	 * 
	 * 
	 */
	Object.defineProperty(loaderContext, "remainingRequest", {
		enumerable: true,
		get: function() {
			if(loaderContext.loaderIndex >= loaderContext.loaders.length - 1 && !loaderContext.resource)
				return "";
			return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(function(o) {
				return o.request;
			}).concat(loaderContext.resource || "").join("!");
		}
	});


    /**
	 * 
	 *  当前 loader 的 路径
	 * 
	 *  如果当前 loaderIndex 是 1 （loader2.js）
	 * 
	 *  当前 loader 的 路径是
	 * 
	 *  loader2.js!loader3.js!./src/index.js
	 * 
	 */
	Object.defineProperty(loaderContext, "currentRequest", {
		enumerable: true,
		get: function() {
			return loaderContext.loaders.slice(loaderContext.loaderIndex).map(function(o) {
				return o.request;
			}).concat(loaderContext.resource || "").join("!");
		}
	});
   
    /**
	 * 
	 * 已经执行的 loader 
	 * 
	 * 如果当前 loaderIndex 是 1 （loader2.js）
	 * 
	 * loader1.js
	 * 
	 */
	Object.defineProperty(loaderContext, "previousRequest", {
		enumerable: true,
		get: function() {
			return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(function(o) {
				return o.request;
			}).join("!");
		}
	});


	Object.defineProperty(loaderContext, "query", {
		enumerable: true,
		get: function() {
			var entry = loaderContext.loaders[loaderContext.loaderIndex];
			return entry.options && typeof entry.options === "object" ? entry.options : entry.query;
		}
	});


	Object.defineProperty(loaderContext, "data", {
		enumerable: true,
		get: function() {
			return loaderContext.loaders[loaderContext.loaderIndex].data;
		}
	});

	// finish loader context
	if(Object.preventExtensions) {
		Object.preventExtensions(loaderContext);
	}

	var processOptions = {
		resourceBuffer: null,
		processResource: processResource
	};

	iteratePitchingLoaders(processOptions, loaderContext, function(err, result) {
		if(err) {
			return callback(err, {
				cacheable: requestCacheable,
				fileDependencies: fileDependencies,
				contextDependencies: contextDependencies,
				missingDependencies: missingDependencies
			});
		}

		callback(null, {
			result: result,
			resourceBuffer: processOptions.resourceBuffer,
			cacheable: requestCacheable,
			fileDependencies: fileDependencies,
			contextDependencies: contextDependencies,
			missingDependencies: missingDependencies
		});
	});
};
