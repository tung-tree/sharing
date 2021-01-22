const { Tapable, SyncHook } = require('Tapable');

const Parser = require('./Parser');
const parser = new Parser();
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const neoAsync = require('neo-async');
const NormalModuleFactory = require('./NormalModuleFactory');
const Chunk = require('./Chunk');

/**
 * main 模板
 */
const mainTemplate = fs.readFileSync(
  path.join(__dirname, 'template', 'main.ejs'),
  'utf8'
);

const mainRender = ejs.compile(mainTemplate);

/**
 * chunck 模板
 */
const chunkTemplate = fs.readFileSync(
  path.join(__dirname, 'template', 'chunk.ejs'),
  'utf8'
);

const chunkRender = ejs.compile(chunkTemplate);

class Compilation extends Tapable {
  constructor(compiler) {
    super();
    this.entries = [];
    this.modules = [];
    this.chunks = [];
    this.files = [];
    this.assets = {};
    this.compiler = compiler;
    this.options = compiler.options;
    this._moduleMaps = new Map();
    this.asyncChunkCounter = 0;
    this.files = []; //生成的文件
    this.assets = {}; //资源
    this.hooks = {
      // entry hook
      addEntry: new SyncHook(['entry', 'name']),
      // fail hook
      failedEntry: new SyncHook(['entry', 'name', 'error']),
      // success hook
      succeedEntry: new SyncHook(['entry', 'name', 'module']),
      // 封装 hook
      seal: new SyncHook(),
      // 成功hook
      succeedModule: new SyncHook(['module']),
      // 失败hook
      failModule: new SyncHook(['error']),
      // 生成 chunk 前 hook
      beforeChunks: new SyncHook(),
      // 生成 chunk 后 hook
      afterChunks: new SyncHook(['chunks'])
    };
  }

  /**
   * main 模块入口
   * @param {*} context 当前的目录
   * @param {*} entry 模块入口
   * @param {*} name  模块名称
   * @param {*} completeCallback 模块编译完成的最终回调
   */
  addEntry(context, entry, name, completeCallback) {
    // 触发 add entry hook
    this.hooks.addEntry.call(entry, name);

    const buildCompleteCallback = (err, module) => {
      if (err) {
        this.hooks.failedEntry.call(entry, name, err);
      } else {
        this.hooks.succeedEntry.call(entry, name, module);
      }
      completeCallback(err);
    };

    this._addModuleChain(
      {
        name, // 模块名称 'main'
        parser, // ast 解释器
        context, // 解析的目录
        rawReqeust: entry, // 入口资源 path
        resource: path.posix.join(context, entry) // 入口资源 绝对 路径
      },
      (module) => {
        this.entries.push(module); // 入口模块放入 entries
      },
      buildCompleteCallback // 解析成功回调
    );
  }

  /**
   * 构建模块链
   * @param {*} data 模块信息
   * @param {*} entryCallback entry 模块回调
   * @param {*} buildCompleteCallback build 成功总回调
   */
  _addModuleChain(data, entryCallback, buildCompleteCallback) {
    // 初始化模块工厂
    const factory = new NormalModuleFactory();

    // 通过工厂创建模块
    const module = factory.create(data);

    // 如果是 入口模块就把模块添加到 entries 上去
    entryCallback && entryCallback(module);

    // 收集 build 模块
    this.modules.push(module);

    // 模块解析完之后调用
    const afterBuild = (err) => {
      if (err) return buildCompleteCallback(err);
      // 如果模块有依赖
      if (module.dependencies && module.dependencies.length > 0) {
        // 继续分析依赖
        this.processModuleDependencies(module, (err) => {
          // 分析依赖完毕，再调完毕回调
          buildCompleteCallback(err, module);
        });
      } else {
        // 分析完毕回调
        buildCompleteCallback(err, module);
      }
    };

    // 开始构建模块
    this.buildModule(module, afterBuild);
  }

  /**
   * 调用 模块 build 方法 ， 构建模块
   * @param {*} module
   * @param {*} afterBuild
   */
  buildModule(module, afterBuild) {
    // todo what ?
    module.build(this, (err) => {
      if (err) {
        this.hooks.failModule.call(err);
      } else {
        this.hooks.succeedModule.call(module);
      }
      afterBuild(err);
    });
  }

  /**
   * 处理当前模块的所有同步依赖
   * @param {*} module 当前模块
   * @param {*} callback 依赖处理完成回调
   */
  processModuleDependencies(module, callback) {
    neoAsync.forEach(
      module.dependencies,
      (dep, done) => {
        /**
         * dep 依赖的模块信息
         * null 因为依赖不是入口，不需要加入到 entires 里面去
         * done 模块解析完毕
         */
        this._addModuleChain(dep, null, done);
      },
      (err) => {
        // 所有依赖分析完毕，执行回调
        callback(err);
      }
    );
  }

  /**
   * 封装
   * @param {*} callback
   */
  seal(callback) {
    // 触发 hook
    this.hooks.seal.call();
    this.hooks.beforeChunks.call();
    // entries 有几个 就有个 chunk
    this.entries.forEach((module) => {
      const chunk = new Chunk(module);
      chunk.modules = this.modules.filter(
        (module) => module.name === chunk.name
      );
      this.chunks.push(chunk);
    });
    // 触发 afterChunks
    this.hooks.afterChunks.call(this.chunks);
    // 创建 chunk 资源
    this.createChunkAssets();
    // 完毕回调
    callback();
  }

  /**
   * 创建 chunk 资源
   */
  createChunkAssets() {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      chunk.files = [];
      const file = chunk.name + '.js';
      chunk.files.push(file);

      let source = '';

      if (chunk.async) {
        // chunk 入口模板
        source = chunkRender({
          chunkName: chunk.entryModule.name,
          modules: chunk.modules
        });
      } else {
        // 主入口模板
        source = mainRender({
          entryModuleId: chunk.entryModule.moduleId,
          modules: chunk.modules
        });
      }
      // 把生成的资源放入 assets
      this.emitAsset(file, source);
    }
  }
  
  emitAsset(file, source) {
    this.assets[file] = source;
    this.files.push(file);
  }
}

module.exports = Compilation;
