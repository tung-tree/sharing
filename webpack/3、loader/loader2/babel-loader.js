const babel = require('@babel/core');
function loader(source, inputSourceMap, data) {
    
  const { code, map, ast } = babel.transform(source, {
    presets: ['@babel/preset-env'],
    inputSourceMap: inputSourceMap,
    sourceMaps: true, //sourceMaps: true 是告诉 babel 要生成 sourcemap
    filename: this.request.split('!')[1].split('/').pop()
  });

  return this.callback(null, code, map, ast);
}
module.exports = loader;
