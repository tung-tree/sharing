
const SingleEntryPlugin = require('./SingleEntryPlugin')

class EntryOptionPlugin {
  apply (compiler) {
    // 订阅 entryOption hook
    compiler.hooks.entryOption.tap('entryOptionPlugin', (context, entry) => {

      /**
       * 
       * 初始化 singleEntryPlugin 并且 订阅 make hook
       * 
       * context : webpack打包的文件根目录
       * entry   : 入口文件path
       * main    : 默认的入口文件名
       * 
       */
      new SingleEntryPlugin(context, entry, 'main').apply(compiler)
    })
  }
}

module.exports = EntryOptionPlugin