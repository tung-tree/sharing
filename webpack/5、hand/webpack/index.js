
const path = require('path')
const NodeEnvirmentPlugin = require('./plugin/NodeEnviromentPlugin')
const WebpackOptionApply = require('./WebpackOptionApply')
const Compiler = require('./Compiler')

const webpack = function (options) {

  // 初始化 context
  // process.cwd() 返回 Node.js 进程的当前工作目录
  options.context = options.context || path.resolve(process.cwd())

  // 初始化 compiler 实例
  const compiler = new Compiler(options.context)

  // 指定 compiler.options
  compiler.options = Object.assign(compiler.options, options)

  // 初始化 webpack 的读写 API
  new NodeEnvirmentPlugin().apply(compiler)

  // 初始化 plugin
  if (Array.isArray(options.plugins)) {
    options.plugins.forEach(plugin => plugin.apply(compiler))
  }

  // 初始化 webpack 打包的 入口 hooks
  new WebpackOptionApply().process(options,compiler)
  
  // 返回 compiler 实例
  return compiler
}

module.exports = webpack