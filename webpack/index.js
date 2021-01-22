var babel = require('@babel/core');

var babylon = require('babylon');

var source = `
   const fn = (a)=>{console.log(a)}
   import aa from './aa'
   import ('./b')
`;

// babel.transform(
//   source,
//   {
//     presets: ['@babel/preset-env'],
//     sourceType: 'module',
//     plugins:['dynamicImport']
//   },
//   function (err, res) {
//     console.log(err)
//     console.log(res.code);
//   }
// );

const ast = babylon.parse(source,{
    sourceType: 'module',
    plugins:['dynamicImport']
})

console.log()


