const {
  Tapable,
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  AsyncParallelHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook
} = require('tapable');

const Stats = require('./Stats');
const Compilation = require('./Compilation');
const NormalModuleFactory = require('./NormalModuleFactory');
const mkdirp = require('mkdirp');
const path = require('path');

class Compiler extends Tapable {
  constructor(context) {
    super();
    this.context = context;
    this.options = {};
    this.hooks = {
      // entry 入口 hook
      entryOption: new SyncBailHook(['context', 'entry']),
      // 运行之前 hook
      beforeRun: new AsyncSeriesHook(['compiler']),
      // 运行 hook
      run: new AsyncSeriesHook(['compiler']),
      // 编译之前hook
      beforeCompile: new AsyncSeriesHook(['params']),
      // 编译 hook
      compile: new SyncHook(['params']),
      // 实例化 Compilation 的 hook
      thisCompilation: new SyncHook(['compilation', 'params']),
      // 实例化 Compilation 的 hook
      compilation: new SyncHook(['compilation', 'params']),
      // 真正编译的hook
      make: new AsyncParallelHook(['compilation']),
      // 编译之后
      afterCompile: new AsyncSeriesHook(['compilation']),
      // 发射文件
      emit: new AsyncSeriesHook(['compilation']),
      // 编译完成
      done: new AsyncSeriesHook(['stats'])
    };
  }

  emitAssets(compilation, callback) {
    const emitFiles = (err) => {
      const assets = compilation.assets;
      let outputPath = this.options.output.path; //dist
      for (let file in assets) {
        let source = assets[file]; //得到文件名和文件内容
        let targetPath = path.posix.join(outputPath, file); //得到输出的路径 targetPath
        this.outputFileSystem.writeFileSync(targetPath, source, 'utf8'); //NodeEnvironmentPlugin
      }
      callback();
    };
    this.hooks.emit.callAsync(compilation, (err) => {
      try {
        console.log(this.options.output.path)
        mkdirp(this.options.output.path).then(emitFiles);
      } catch (error) {
        console.log(error);
      }
    });
  }
  /**
   * webpack run 方法
   *
   * @param {*} callback run done callback
   */
  run(finalCallback) {
    /**
     * 编译完成的回调
     * @param {*} err
     * @param {*} compilation
     */

    const onCompiled = (err, compilation) => {
      this.emitAssets(compilation, (err) => {
        let stats = new Stats(compilation); //stats是一 个用来描述打包后结果的对象
        this.hooks.done.callAsync(stats, (err) => {
          //done表示整个流程结束了
          finalCallback(err, stats);
        });
      });
    };

    // 触发订阅的 beforeRun hook
    this.hooks.beforeRun.callAsync(this, (err) => {
      // 触发订阅的 run hook
      this.hooks.run.callAsync(this, (err) => {
        this.compile(onCompiled);
      });
    });
  }

  compile(compiledCallback) {
    // 初始化 Compilation 实例化需要的参数
    const params = this.newCompilationParams();
    // 触发 beforeCompile hook
    this.hooks.beforeCompile.callAsync(params, (err) => {
      // 触发 compile hook
      this.hooks.compile.call(params);
      // 实例化 Compilation 对象
      // 此对象就是贯穿着一次编译的生命周期
      // 里面保存了一次编译的所有资源信息
      const compilation = this.newCompilation(params);
      // 触发 make hooks
      this.hooks.make.callAsync(compilation, (err) => {
        compilation.seal((err) => {
          this.hooks.afterCompile.callAsync(compilation, (err) => {
            compiledCallback(err, compilation);
          });
        });
      });
    });
  }

  /**
   * 初始化 compilation 实例需要的 模块工厂
   */
  newCompilationParams() {
    return {
      normalModuleFactory: new NormalModuleFactory()
    };
  }

  /**
   * 实例化 compilation 对象
   */
  newCompilation(params) {
    // 初始化 compilation
    const compilation = new Compilation(this);
    // 触发 thisCompilation hook
    this.hooks.thisCompilation.call(compilation, params);
    // 触发 compilation hook
    this.hooks.compilation.call(compilation, params);
    // 返回 compilation
    return compilation;
  }
}

module.exports = Compiler;
