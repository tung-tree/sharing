const path = require('path');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const generate = require('@babel/generator').default;
const neoAsync = require('neo-async');
const { runLoaders } = require('loader-runner');
const fs = require('fs');

class NormalModule {
  constructor(data) {
    const { name, context, resource, parser, rawRequest, async = false } = data;
    this.name = name;
    this._ast = null;
    this._source = '';
    this.async = async;
    this.parser = parser;
    this.context = context;
    this.resource = resource;
    this.rawRequest = rawRequest;
    this.moduleId = './' + path.posix.relative(context, resource);
    this.blocks = [];
    this.dependencies = [];
  }

  /**
   * 模块分析入口
   * @param {
   * } compilation
   * @param {*} callback
   */
  build(compilation, callback) {
    // 拿到模块依赖
    const getDependencyResource = (node) => {
      // 模块名称
      const moduleName = node.arguments[0].value;
      // 模块名称后缀，没有默认为 '.js'
      const extension =
        moduleName.split(path.posix.sep).pop().indexOf('.') == -1 ? '.js' : '';
      // 拼接模块的绝对路径
      const dependencyResource = path.posix.join(
        path.posix.dirname(this.resource),
        moduleName + extension
      );
      // 生成模块的相对路径（模块ID）
      // 在webpack中由于所有的模块ID都为相对路径，所以这里要把绝对路径转换成相对路径
      const dependencyModuleId =
        '.' +
        path.posix.sep +
        path.posix.relative(this.context, dependencyResource);

      return { moduleName, dependencyResource, dependencyModuleId };
    };

    // 把同步依赖保存到 dependencies 上
    const pushDependencies = (node) => {
      // 获取依赖信息
      const dep = getDependencyResource(node);
      // 添加依赖
      this.dependencies.push({
        name: this.name, // 一个 entry 下的所有依赖模块名称都是相同的
        context: this.context,
        parser: this.parser,
        rawRequest: dep.moduleName, // 依赖模块名称（原始路径）
        moduleId: dep.dependencyModuleId, // 依赖模块 相对路径（模块ID）
        resource: dep.dependencyResource // 依赖模块 绝对路径
      });
      return dep;
    };

    // 保存异步依赖到 blocks ，
    // 注意每个异步依赖都是一个 chunk
    // 要保存到 entries 上去
    const pushBlocks = (node, chunkName) => {
      // 获取依赖信息
      const dep = getDependencyResource(node);

      // 添加 chunk 模块
      this.blocks.push({
        async: true, // 标明是异步 chunk
        parser: this.parser,
        name: chunkName, // chunk的模块名称
        context: this.context,
        rawRequest: dep.moduleName,
        entry: dep.dependencyModuleId, // chunk入口
        moduleId: dep.dependencyModuleId, // 依赖模块 相对路径（模块ID）
        resource: dep.dependencyResource // 依赖模块 绝对路径
      });
      return dep;
    };

    // traverse CallExpression
    const CallExpressionFn = (nodePath) => {
      const node = nodePath.node;

      if (node.callee.name === 'require') {
        // 收集模块依赖
        const { dependencyModuleId } = pushDependencies(node);
        // 修改 require 为 __webpack_require__
        node.callee.name = '__webpack_require__';
        // 修改 node 的 arguments
        node.arguments = [types.stringLiteral(dependencyModuleId)];
      } else if (types.isImport(nodePath.node.callee)) {
        // import(/* webpackChunkName ： "test"*/ './src/test.js')
        // 默认的代码块ID
        let chunkName = compilation.asyncChunkCounter++;
        // /* webpackChunkName : "chunkName" */
        const leadingComments = node.arguments[0].leadingComments;
        // 如果有命名，提取 chunkName
        if (Array.isArray(leadingComments) && leadingComments.length > 0) {
          const comments = leadingComments[0].value;
          const regexp = /webpackChunkName:\s*['"]([^'"]+)['"]/;
          chunkName = comments.match(regexp)[1];
        }
        const { dependencyModuleId } = pushBlocks(node, chunkName);
        // 替换 import(...)
        nodePath.replaceWithSourceString(
          `__webpack_require__.e("${chunkName}").then(__webpack_require__.t.bind(null,"${dependencyModuleId}", 7))`
        );
      }
    };

    // 开始build资源
    this.doBuild(compilation, (err, source) => {
      if (err) return callback(err);
      // 资源内容
      this._source = source;
      // 获取源代码的 ast
      this._ast = this.parser.parser(source);
      // 遍历 ast
      traverse(this._ast, { CallExpression: CallExpressionFn });
      // 通过最新的 ast 生成最新的源代码
      const { code } = generate(this._ast);
      // 更新源代码
      this._source = code;
      // 循环模块依赖的 chunk ，开始 build chunk
      neoAsync.forEach(
        this.blocks,
        (block, done) => {
          compilation._addModuleChain(
            block,
            (module) => compilation.entries.push(module),
            done
          );
        },
        (err) => {
          // 所有依赖 build 完最终的回调
          callback(err);
        }
      );

      // let blocksLen = this.blocks.length;
      // this.blocks.forEach((block) => {
      //   const { context, entry, name, async } = block;
      //   compilation._addModuleChain(context, entry, name, async, (err) => {
      //     blocksLen = blocksLen - 1;
      //     if (blocksLen === 0) {
      //       callback()
      //     }
      //   });
      // });
    });
  }

  /**
   * 获取build资源
   * @param {*} compilation
   * @param {*} callback
   */
  doBuild(compilation, callback) {
    /**
     * resource 资源的绝对路径
     */
    this.getSoruce(this.resource, compilation, (err, source) => {
      callback(err, source);
    });
  }

  /**
   * 通过 loaderRuner 读取资源
   * @param {*} resource
   * @param {*} compilation
   * @param {*} callback
   */
  getSoruce(resource, compilation, callback) {
    // 拿到 config.js 配置忘记的 rulues
    const {
      module: { rules = [] }
    } = compilation.options;

    let loaders = [];

    // 遍历 rules 拿到所有的 配置的 loader
    for (let i = 0; i < rules.length; i++) {
      if (rules[i].test.test(resource)) {
        loaders = [...loaders, ...rules[i].use];
      }
    }

    // 标准化loader
    loaders = loaders.map((loader) =>
      require.resolve(
        path.posix.join(this.context, '5、hand/webpack/loader', loader)
      )
    );

    runLoaders(
      {
        loaders, // 所有的loader
        context: {}, // 可以传自定义的参数，后续loader中可以使用
        resource: this.resource, // 资源绝对路径
        readResource: fs.readFile.bind(fs)
      },
      (err, { result }) => {
        callback(err, result[0]);
      }
    );
  }
}

module.exports = NormalModule;
