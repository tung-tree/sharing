/**
 *
 *  同步 瀑布型 hook
 *
 *  依次执行订阅事件，把上一个事件的返回值（非undefined），当做下个函数的入参
 *
 */

const { SyncWaterfallHook } = require('tapable');

class Test {
  constructor() {
    this.hooks = {
      waterfull: new SyncWaterfallHook(['age'])
    };
  }
}

var t = new Test();

t.hooks.waterfull.tap('zhangsang', (age) => {
  console.log(`zhangsang age : ${age}`);
  return age + 1;
});

t.hooks.waterfull.tap('lisi', (age) => {
  console.log(`lisi age : ${age}`);
  return age + 1;
});

t.hooks.waterfull.tap('wangwu', (age) => {
  console.log(`wangwu age : ${age}`);
});

t.hooks.waterfull.call(30);

// var _context;
// var _x = this._x;

// var _fn0 = _x[0];
// var _result0 = _fn0(age);
// if (_result0 !== undefined) {
//   age = _result0;
// }
// var _fn1 = _x[1];
// var _result1 = _fn1(age);
// if (_result1 !== undefined) {
//   age = _result1;
// }
// var _fn2 = _x[2];
// var _result2 = _fn2(age);
// if (_result2 !== undefined) {
//   age = _result2;
// }
// return age;

class MySyncWaterfallHook {
  constructor() {
    this.taps = [];
  }
  tap(name, handler) {
    this.taps.push({ name, handler });
  }
  call(age) {
    for (let i = 0; i < this.taps.length; i++) {
      let { handler } = this.taps[i];
      let res = handler(age);
      if (res !== undefined) {
        age = res;
      }
    }
  }
}
