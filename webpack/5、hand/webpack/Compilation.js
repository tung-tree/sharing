const {
  Tapable,
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  AsyncSeriesHook
} = require('Tapbale');

const Parser = require('./Parser');
const parser = new Parser();
const path = require('path');
const neoAsync = require('neo-async');
const Chunk = require('./Chunk')
const mainTpl = fs.readFileSync(path.join(__dirname, 'template', 'main.ejs'), 'utf-8')
const chunkTpl = fs.readFileSync(path.join(__dirname, 'template', 'chunk.ejs'), 'utf-8')
const mainRender = ejs.compile(mainTpl)
const chunkRender = ejs.compile(chunkTpl)
const NormalModuleFactory = require('./NormalModuleFactory');


class Compilation extends Tapable {
  constructor(compiler) {
    this.compiler = compiler;
    this.entries = [];
    this.modules = [];
    this.chunks = [];
    this.files = [];
    this.assets = {}
    this._moduleMaps = new Map();
    this.hooks = {
      addEntry: new SyncHook(['entry', 'name']),
      failedEntry: new SyncHook(['entry', 'name', 'error']),
      succeedEntry: new SyncHook(['entry', 'name', 'module']),
      seal: new SyncHook(),
      beforeChunks: new SyncHook(),
      afterChunks: new SyncHook(['chunks'])
    };
  }

  /**
   * 模块入口
   * @param {*} context 当前的目录
   * @param {*} entry 模块入口
   * @param {*} name  模块名称
   * @param {*} callback 模块编译完成的最终回调
   */
  addEntry (context, entry, name, completeCallback) {
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
      resource: path.posix.join(context, entry),
    }

    this._addModuleChain(data, entryCallback, buildCompleteCallback);
  }

  /**
   * 构建模块链
   * @param {*} data 模块信息
   * @param {*} entryCallback entry 模块回调
   * @param {*} buildCompleteCallback build 成功总回调
   */
  _addModuleChain (data, entryCallback, buildCompleteCallback) {

    // 初始化模块工厂
    const factory = new NormalModuleFactory();

    // 通过工厂创建模块
    const module = factory.create(data);

    // 如果是 入口模块就把模块添加到 entries 上去
    entryCallback && entryCallback(module);

    // 收集 build 模块
    this.modules.push(module);

    // 模块解析完之后调用
    const afterBuild = () => {
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
  buildModule (module, afterBuild) {
    module.build(this, (err) => {
      this.hooks.succeedModule.call(module);
      afterBuild();
    });
  }

  /**
   * 处理当前模块的所有同步依赖
   * @param {*} module 当前模块
   * @param {*} callback 依赖处理完成回调
   */
  processModuleDependencies (module, callback) {
    neoAsync.forEach(module.dependencies, (dep, done) => {
      const { name, context, rawRequest, resource, moduleId, parser } = dep
      this._addModuleChain({
        name,
        parser,
        context,
        moduleId,
        resource,
        rawRequest,
      }, null, done)
    }, callback)
  }

  seal (callback) {
    this.hooks.seal.call()
    this.hooks.beforeChunks.call()
    this.entries.forEach(module => {
      const chunk = new Chunk(module)
      chunk.modules = this.modules.filter(module => module.name === chunk.name)
      this.chunks.push(chunk)
    })
    this.hooks.afterChunks.call(this.chunks)
    callback(null)
  }

  createChunkAssets () {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]
      chunk.files = []
      const file = chunk.name + '.js'
      chunk.files.push(file)
      let source = ''
      if (chunk.async) {
        source = chunkRender({
          name: chunk.entryModule.name,
          modules: chunk.modules
        })
      } else {
        source = mainRender({
          entryId: chunk.entryModule.moduleId,
          modules: chunk.modules
        })
      }
      this.emitAsset(file, source)
    }
  }
}

module.exports = Compilation;
