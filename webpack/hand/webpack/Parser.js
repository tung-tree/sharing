const babylon = require('babylon');
const { Tapable } = require('Tapable');

class Parser extends Tapable {
  constructor() {
    super();
  }
  parser(source) {
    return babylon.parser(source, {
      sourceType: 'module',
      plugins: ['dynamicImport']
    });
  }
}

module.exports = Parser;
