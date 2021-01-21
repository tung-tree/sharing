
const parser = require('@babel/parser');

const { Tapable } = require('Tapable');

class Parser extends Tapable {
  constructor() {
    super();
  }
  parser(source) {
    return parser.parse(source, {
      sourceType: 'module',
      plugins: ['dynamicImport']
    });
  }
}

module.exports = Parser;
