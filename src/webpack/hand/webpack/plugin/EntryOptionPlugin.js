
const SingleEntryPlugin = require('./SingleEntryPlugin')

class EntryOptionPlugin {
  constructor() { }
  apply (compiler) {
    // 订阅 entryOption hook
    compiler.hooks.entryOption.tap('entryOptionPlugin', (context, entry) => {
      // 初始化 singleEntryPlugin 并且 订阅 make hook
      new SingleEntryPlugin(context, entry, 'main').apply(compiler)
    })
  }
}

module.exports = EntryOptionPlugin