class SingleEntryPlugin {
  constructor(context, entry, name) {
    this.name = name // 默认 main
    this.entry = entry
    this.context = context
  }
  apply (compiler) {
    /**
     * 订阅 compiler.hooks.make 事件
     * 这个事件非常非常重要，是webpack打包的真正起点
     * compilation： 是每次打包都要创建的实例，它里面可以说是包括了打包过程生产的所有的资源
     * callback ：entry 编译完成回调
     * 
     * 等待 make 被触发
     */
    compiler.hooks.make.tapAsync('singleEntryPlugin', (compilation, callback) => {
      const { name, entry, context } = this
      compilation.addEntry(context, entry, name, callback)
    })
  }
}

module.exports = SingleEntryPlugin