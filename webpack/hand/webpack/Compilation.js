const {
  Tapable,
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  AsyncSeriesHook
} = require('Tapbale');
const NormalModuleFactory = require('./NormalModuleFactory');
const Parser = require('./Parser');
const parser = new Parser();
const path = require('path');

class Compilation extends Tapable {
  constructor(compiler) {
    this.compiler = compiler;
    this.entries = [];
    this.modules = [];
    this._moduleMaps = new Map();
    this.hooks = {
      addEntry: new SyncHook(['entry', 'name']),
      failedEntry: new SyncHook(['entry', 'name', 'error']),
      succeedEntry: new SyncHook(['entry', 'name', 'module'])
    };
  }

  /**
   * 模块入口
   * @param {*} context 当前的目录
   * @param {*} entry 模块入口
   * @param {*} name  模块名称
   * @param {*} callback 模块编译完成的最终回调
   */
  addEntry(context, entry, name, completeCallback) {
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

    this._addModuleChain(
      context,
      entry,
      name,
      entryCallback,
      buildCompleteCallback
    );
  }

  _addModuleChain(context, entry, name, entryCallback, buildCompleteCallback) {
    const factory = new NormalModuleFactory();

    const module = factory.create({
      name,
      context,
      parser,
      rawReqeust: entry,
      resource: path.posix.resolve(context, entry)
    });

    entryCallback && entryCallback(module);

    this.entries.push(module);

    this.modules.push(module);

    const afterBuild = () => {
      if (module.dependencies && module.dependencies.length > 0) {
        // 开始 build dep
        this.processModuleDependencies(module, (err) => {
          buildCompleteCallback(null, module);
        });
      } else {
        return buildCompleteCallback(null, module);
      }
    };
    this.buildModule(module, afterBuild);
  }

  buildModule(module, afterBuild) {
    module.build(this, (err) => {
      this.hooks.succeedModule.call(module);
      afterBuild();
    });
  }

  processModuleDependencies(module, callback) {
    
  }
}

module.exports = Compilation;
