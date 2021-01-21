const a = require('./a');
const b = require('./b');

import(/* webpackChunkName: "async" */ './c').then(res => {
    console.log(res)
})
