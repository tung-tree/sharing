
const EntryOptionPlugin = require('./plugin/EntryOptionPlugin')

class WebpackOptionApply {
  constructor() { 
    
  }
  process (options, compiler) {
    // 初始化 EntryOptionPlugin ，订阅 entryOption hook
    new EntryOptionPlugin().apply(compiler)
    // 触发 entryOption hook
    compiler.hooks.entryOption.call(options.context, options.entry)
  }
}