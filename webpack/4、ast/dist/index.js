/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./loadsh.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./loadsh.js":
/*!*******************!*\
  !*** ./loadsh.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("throw new Error(\"Module build failed (from /Users/yanpingli/learn/sharing/node_modules/babel-loader/lib/index.js):\\nError: [BABEL] /Users/yanpingli/learn/sharing/webpack/4、ast/loadsh.js: .library is not a valid Plugin property\\n- Maybe you meant to use\\n\\\"plugin\\\": [\\n  [\\\"/Users/yanpingli/learn/sharing/webpack/4、ast/babel-plugin-import.js\\\", {\\n  \\\"library\\\": [\\n    \\\"lodash\\\"\\n  ]\\n}]\\n]\\nTo be a valid plugin, its name and options should be wrapped in a pair of brackets\\n    at /Users/yanpingli/learn/sharing/node_modules/@babel/core/lib/config/validation/plugins.js:65:42\\n    at Array.forEach (<anonymous>)\\n    at validatePluginObject (/Users/yanpingli/learn/sharing/node_modules/@babel/core/lib/config/validation/plugins.js:54:20)\\n    at /Users/yanpingli/learn/sharing/node_modules/@babel/core/lib/config/full.js:256:55\\n    at Generator.next (<anonymous>)\\n    at Function.<anonymous> (/Users/yanpingli/learn/sharing/node_modules/@babel/core/lib/gensync-utils/async.js:26:3)\\n    at Generator.next (<anonymous>)\\n    at step (/Users/yanpingli/learn/sharing/node_modules/gensync/index.js:261:32)\\n    at evaluateAsync (/Users/yanpingli/learn/sharing/node_modules/gensync/index.js:291:5)\\n    at Function.errback (/Users/yanpingli/learn/sharing/node_modules/gensync/index.js:113:7)\");\n\n//# sourceURL=webpack:///./loadsh.js?");

/***/ })

/******/ });