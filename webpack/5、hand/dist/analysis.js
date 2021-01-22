(function (modules) {

    /**
     * chunk jsop 回调函数
     * @param {*} data 
     */
    function webpackJsonpCallback(data) {
      // 'aysnc'  
      var chunkIds = data[0];

      // chunk 的组成模块
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
          //  installedChunks 中 取出 'aysnc' chunk 的 resolve
          resolves.push(installedChunks[chunkId][0]);
        }
        
        // 标识已经安装
        installedChunks[chunkId] = 0;
      }

      for (moduleId in moreModules) {
        if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
          // 把 async chunk 的 依赖模块 merge modules 中  
          modules[moduleId] = moreModules[moduleId];
        }
      }

      if (parentJsonpFunction) parentJsonpFunction(data);

      while (resolves.length) {
        /**
         * const resolve = resolves.shift()
         * resolve() // 释放 promise
         * */  
        resolves.shift()();
      }
    }

    var installedModules = {};

    // 已经安装的chunk, 默认是 mian 入口
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

    /**
     * webpack 自己定义的 require 函数
     * @param {*} moduleId 
     */
    function __webpack_require__(moduleId) {
      
      // 缓存  
      if (installedModules[moduleId]) {
        return installedModules[moduleId].exports;
      }
      
      // 定义 缓存 模块
      var module = (installedModules[moduleId] = {
        i: moduleId,
        l: false,   // 安装标识
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

    /**
     * 网络加载 chunk 
     * @param {*} chunkId  async
     */
    __webpack_require__.e = function requireEnsure(chunkId) {

      var promises = [];

      // undefined
      var installedChunkData = installedChunks[chunkId];

      if (installedChunkData !== 0) {

        // installedChunks[chunkId] = [resolve, reject, promise]  
        if (installedChunkData) {
          // 复用 promise
          promises.push(installedChunkData[2]);
        } else {
          
          // 为 每个 async chunk 实力 话 promise 
          var promise = new Promise(function (resolve, reject) {
            // 暂存 promise 的 resolve, reject
            // 1、installedChunks['asyn'] = [resolve, reject]
            // 2、installedChunkData = [resolve, reject]
            installedChunkData = installedChunks[chunkId] = [resolve, reject];
          });

          // 把 promise 保存到 installedChunkData 中
          // installedChunkData = [resolve, reject, promise]
          // promises 是 promise 队列, 收集 多个 chunk 的 promise
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
  
    /**
     * 
     * 根据 模块 标识 返回 模块
     * 
     * getter.a  返回 getter
     * 
     * @param {*} module 
     */
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
  
    /**
     * 判断 object 是有 property 属性
     * @param {*} object 
     * @param {*} property 
     */
    __webpack_require__.o = function (object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    };
  
    __webpack_require__.p = '';
  
    __webpack_require__.oe = function (err) {
      console.error(err);
      throw err;
    };
    
    // 定义 webpackJsonp 全局 数组 变量
    var jsonpArray = (window['webpackJsonp'] = window['webpackJsonp'] || []);

    var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);

    // 替换数组的 push 方法
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
  