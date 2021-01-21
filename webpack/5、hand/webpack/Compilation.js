const {
  Tapable,
  SyncHook,
} = require('Tapable');

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
      addEntry: new SyncHook(['entry', 'name']),
      failedEntry: new SyncHook(['entry', 'name', 'error']),
      succeedEntry: new SyncHook(['entry', 'name', 'module']),
      seal: new SyncHook(),
      succeedModule: new SyncHook(),
      beforeChunks: new SyncHook(),
      afterChunks: new SyncHook(['chunks'])
    };
  }

  /**
   * main 模块入口
   * @param {*} context 当前的目录
   * @param {*} entry 模块入口
   * @param {*} name  模块名称
   * @param {*} callback 模块编译完成的最终回调
   */
  addEntry(context, entry, name, completeCallback) {
    
    // 触发 add entry hook
    this.hooks.addEntry.call(entry, name);

    const entryCallback = (module) => {
      this.entries.push(module);
    };

    const buildCompleteCallback = (err, module) => {
      if (err) {
        this.hooks.failedEntry.call(entry, name, err);
        completeCallback(err);
      } else {
        this.hooks.succeedEntry.call(entry, name, module);
        completeCallback(null, module);
      }
    };

    const data = {
      name,
      parser,
      context,
      rawReqeust: entry,
      resource: path.posix.join(context, entry)
    };

    this._addModuleChain(data, entryCallback, buildCompleteCallback);
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
      // 如果模块有依赖
      if (module.dependencies && module.dependencies.length > 0) {
        this.processModuleDependencies(module, (err) => {
          buildCompleteCallback(err, module);
        });
      } else {
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
    module.build(this, (err) => {
      this.hooks.succeedModule.call(module);
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
        const { name, context, rawRequest, resource, moduleId, parser } = dep;
        this._addModuleChain(
          {
            name,
            parser,
            context,
            moduleId,
            resource,
            rawRequest
          },
          null,
          done
        );
      },
      callback
    );
  }

  seal(callback) {
    this.hooks.seal.call();
    this.hooks.beforeChunks.call();
    this.entries.forEach((module) => {
      const chunk = new Chunk(module);
      chunk.modules = this.modules.filter(
        (module) => module.name === chunk.name
      );
      this.chunks.push(chunk);
    });
    this.hooks.afterChunks.call(this.chunks);
    this.createChunkAssets();
    callback(null);
  }

  createChunkAssets() {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      chunk.files = [];
      const file = chunk.name + '.js';
      chunk.files.push(file);
      let source = '';
      if (chunk.async) {
        source = chunkRender({
          chunkName: chunk.entryModule.name,
          modules: chunk.modules
        });
      } else {
        source = mainRender({
          entryModuleId: chunk.entryModule.moduleId,
          modules: chunk.modules
        });
      }
      this.emitAsset(file, source);
    }
  }

  emitAsset(file, source) {
    this.assets[file] = source;
    this.files.push(file);
  }
}

module.exports = Compilation;
