(function (modules) {
  function webpackJsonpCallback(data) {
    var chunkIds = data[0];
    var moreModules = data[1];
    var moduleId,
      chunkId,
      i = 0,
      resolves = [];
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (
        Object.prototype.hasOwnProperty.call(installedChunks, chunkId) &&
        installedChunks[chunkId]
      ) {
        resolves.push(installedChunks[chunkId][0]);
      }
      installedChunks[chunkId] = 0;
    }
    for (moduleId in moreModules) {
      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        modules[moduleId] = moreModules[moduleId];
      }
    }
    if (parentJsonpFunction) parentJsonpFunction(data);
    while (resolves.length) {
      resolves.shift()();
    }
  }
  var installedModules = {};
  var installedChunks = {
    main: 0
  };
  function jsonpScriptSrc(chunkId) {
    return (
      __webpack_require__.p +
      '' +
      ({ async: 'async' }[chunkId] || chunkId) +
      '.js'
    );
  }
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    });
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    module.l = true;
    return module.exports;
  }
  __webpack_require__.e = function requireEnsure(chunkId) {
    var promises = [];
    var installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        var promise = new Promise(function (resolve, reject) {
          installedChunkData = installedChunks[chunkId] = [resolve, reject];
        });
        promises.push((installedChunkData[2] = promise));
        var script = document.createElement('script');
        var onScriptComplete;
        script.charset = 'utf-8';
        script.timeout = 120;
        if (__webpack_require__.nc) {
          script.setAttribute('nonce', __webpack_require__.nc);
        }
        script.src = jsonpScriptSrc(chunkId);
        var error = new Error();
        onScriptComplete = function (event) {
          script.onerror = script.onload = null;
          clearTimeout(timeout);
          var chunk = installedChunks[chunkId];
          if (chunk !== 0) {
            if (chunk) {
              var errorType =
                event && (event.type === 'load' ? 'missing' : event.type);
              var realSrc = event && event.target && event.target.src;
              error.message =
                'Loading chunk ' +
                chunkId +
                ' failed.\n(' +
                errorType +
                ': ' +
                realSrc +
                ')';
              error.name = 'ChunkLoadError';
              error.type = errorType;
              error.request = realSrc;
              chunk[1](error);
            }
            installedChunks[chunkId] = undefined;
          }
        };
        var timeout = setTimeout(function () {
          onScriptComplete({ type: 'timeout', target: script });
        }, 120000);
        script.onerror = script.onload = onScriptComplete;
        document.head.appendChild(script);
      }
    }
    return Promise.all(promises);
  };


  __webpack_require__.m = modules;

  __webpack_require__.c = installedModules;



  __webpack_require__.d = function (exports, name, getter) {    
    // 如果 exports 没有 name 属性
    if (!__webpack_require__.o(exports, name)) {
      // 那么 exportsp[name] === getter
      Object.defineProperty(exports, name, { enumerable: true, get: getter });
    }

  };

  /**
   * 标识是 es module
   * @param {*} exports 
   */
  __webpack_require__.r = function (exports) {

    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      // const obj = {}
      // Object.defineProperty(obj, Symbol.toStringTag, { value: 'Module' });
      // Object.prototype.toString.call(obj) === [object Module]
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    
    // 标识是es model
    Object.defineProperty(exports, '__esModule', { value: true });
  };


 /**
  * 
  * @param {*} value  ./src/c.js
  * @param {*} mode  7
  */
  __webpack_require__.t = function (value, mode) {

    // & 是 按位与 运算符
    // 7 & 1 =  0000 0111 & 0000 0001 = 0000 0001 = 1
    if (mode & 1) value = __webpack_require__(value);
    // 7 & 8 =  0000 0111 & 0000 1000 = 0000 0000 = 0
    if (mode & 8) return value;
    // 7 & 4 =  0000 0111 & 0000 0100 = 0000 0000 = 1
    if (mode & 4 && typeof value === 'object' && value && value.__esModule)
      return value;

    var ns = Object.create(null);

    // 标识是 es module
    __webpack_require__.r(ns);

    // 当 加载的是一个 es6 模块时， import aa from 'aaa'
    // 组装成 es modle 导出
    Object.defineProperty(ns, 'default', { enumerable: true, value: value });

    if (mode & 2 && typeof value != 'string')
      for (var key in value)
        // 就是 用 Object.defineProperty 给 ns 定义一个 key 属性 
        __webpack_require__.d(
          ns,
          key,
          function (key) {
            return value[key];
          }.bind(null, key)
        );
    return ns;
  };


  __webpack_require__.n = function (module) {

    var getter = module && module.__esModule
        ? function getDefault() {
            // 如果是 es6 模块
            return module['default'];
          }
        : function getModuleExports() {
            // comonjs 模块
            return module;
          };

    __webpack_require__.d(getter, 'a', getter);

    return getter;
  };

  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  __webpack_require__.p = '';

  __webpack_require__.oe = function (err) {
    console.error(err);
    throw err;
  };
  var jsonpArray = (window['webpackJsonp'] = window['webpackJsonp'] || []);
  var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
  jsonpArray.push = webpackJsonpCallback;
  jsonpArray = jsonpArray.slice();
  for (var i = 0; i < jsonpArray.length; i++)
    webpackJsonpCallback(jsonpArray[i]);
  var parentJsonpFunction = oldJsonpFunction;
  return __webpack_require__((__webpack_require__.s = './src/index.js'));
})({
  './src/a.js': function (module, exports) {
    const a = () => {
      console.log('a');
    };
  },
  './src/b.js': function (module, exports) {
    const b = () => {
      console.log('b');
    };
  },
  './src/index.js': function (module, exports, __webpack_require__) {
    const a = __webpack_require__('./src/a.js');
    const b = __webpack_require__('./src/b.js');
    __webpack_require__
      .e('async')
      .then(__webpack_require__.t.bind(null, './src/c.js', 7))
      .then((res) => {
        console.log(res);
      });
  }
});
