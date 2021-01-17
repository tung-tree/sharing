

class Compilation {
  constructor(compiler) { 
    this.compiler = compiler
    
  }

  /**
   * 模块入口
   * @param {*} context 当前的目录
   * @param {*} entry 模块入口
   * @param {*} name  模块名称
   * @param {*} callback 模块编译完成的最终回调
   */
  addEntry (context, entry, name, callback) { 
    
  }
}

module.exports = Compilation