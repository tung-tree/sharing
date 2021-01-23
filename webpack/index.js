var babel = require('@babel/core');

var babylon = require('babylon');

const fs = require('fs');
const source = fs.readFileSync('./webpack/src/index.js', 'utf-8');

babel.transform(
  source,
  {
    //   plugins: ['@babel/plugin-transform-modules-commonjs']
    // cwd: '/Users/yanpingli/learn/sharing',
    // filename: '/Users/yanpingli/learn/sharing/webpack/src/index.js',
    // sourceFileName: '/Users/yanpingli/learn/sharing/webpack/src/index.js',
    // root: '/Users/yanpingli/learn/sharing',
    // envName: 'development',
    // cloneInputAst: true,
    // configFile: false,
    // passPerPreset: false,
    // babelrc: false,
    // plugins: [],
    // sourceMaps: false,

    presets: ['@babel/preset-env'],
    caller: {
      name: 'babel-loader',
      target: 'web',
      supportsStaticESM: true,
      supportsDynamicImport: true,
      supportsTopLevelAwait: true
    }
  },
  function (err, res) {
    console.log(err);
    console.log(res.code);
  }
);

// const ast = babylon.parse(source,{
//     sourceType: 'module',
//     presets: ['@babel/preset-env'],
//     plugins:['dynamicImport']
// })
