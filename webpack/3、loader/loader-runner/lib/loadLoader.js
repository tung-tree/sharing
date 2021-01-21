var LoaderLoadingError = require("./LoaderLoadingError");
var url;

/***
 * 
 * loader  就是 loaderObject 
 * 
 */
module.exports = function loadLoader(loader, callback) {
	if(loader.type === "module") {
		// es modlue 方式
		try {
			if(url === undefined) url = require("url");
			var loaderUrl = url.pathToFileURL(loader.path);
			var modulePromise = eval("import(" + JSON.stringify(loaderUrl.toString()) + ")");
			modulePromise.then(function(module) {
				handleResult(loader, module, callback);
			}, callback);
			return;
		} catch(e) {
			callback(e);
		}
	} else {
		// commomjs 方式
		try {
            // 通过 loader.path  加载 loader 
			var module = require(loader.path);
		} catch(e) {
			// it is possible for node to choke on a require if the FD descriptor
			// limit has been reached. give it a chance to recover.
			if(e instanceof Error && e.code === "EMFILE") {
				var retry = loadLoader.bind(null, loader, callback);
				if(typeof setImmediate === "function") {
					// node >= 0.9.0
					return setImmediate(retry);
				} else {
					// node < 0.9.0
					return process.nextTick(retry);
				}
			}
			return callback(e);
		}
		return handleResult(loader, module, callback);
	}
};

function handleResult(loader, module, callback) {

	if(typeof module !== "function" && typeof module !== "object") {
		return callback(new LoaderLoadingError(
			"Module '" + loader.path + "' is not a loader (export function or es6 module)"
		));
	}
 
	// 把 loader 函数 赋值给 loaderObject.normal
	// 所以 normal 就是 真正的 loader 函数
	loader.normal = typeof module === "function" ? module : module.default;
	
	// loaderObject.pitch 函数
	loader.pitch = module.pitch;

	loader.raw = module.raw;

	if(typeof loader.normal !== "function" && typeof loader.pitch !== "function") {
		return callback(new LoaderLoadingError(
			"Module '" + loader.path + "' is not a loader (must have normal or pitch function)"
		));
	}
	callback();
}
