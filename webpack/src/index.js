// import person, { hi } from './e';
// console.log(hi, JSON.stringify(person));

const a = require('./a');
const b = require('./b');

require('style.less')

import(/* webpackChunkName: "async" */ './c').then((res) => {
  console.log(res);
});

console.log('a function' , a())
console.log('b function', b())
