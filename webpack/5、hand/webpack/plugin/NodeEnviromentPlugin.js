
const fs = require('fs')

class NodeEnvirmentPlugin {
  constructor() { }
  apply (compiler) {
    compiler.inputFileSystem = fs
    compiler.outputFileSystem = fs
  }
}

module.exports = NodeEnvirmentPlugin