/**
 *
 *  同步熔断型 hook
 * 
 *  依次执行订阅事件，遇到返回非 undefined 的 事件，就停止执行
 *
 *
 */

const { SyncBailHook } = require('tapable');

class Test {
  constructor() {
    this.hooks = {
      bail: new SyncBailHook(['age'])
    };
  }
}

var t = new Test();

t.hooks.bail.tap('zhangsang', (age) => {
  console.log(`zhangsang age : ${age}`);
});

t.hooks.bail.tap('lisi', (age) => {
  console.log(`lisi age : ${age}`);
  return 1;
});

t.hooks.bail.tap('wangwu', (age) => {
  console.log(`wangwu age : ${age}`);
});

t.hooks.bail.call('30');

// var _context;
// var _x = this._x;
// var _fn0 = _x[0];
// var _result0 = _fn0(age);
// if (_result0 !== undefined) {
//   return _result0;
// } else {
//   var _fn1 = _x[1];
//   var _result1 = _fn1(age);
//   if (_result1 !== undefined) {
//     return _result1;
//   } else {
//     var _fn2 = _x[2];
//     var _result2 = _fn2(age);
//     if (_result2 !== undefined) {
//       return _result2;
//     } else {
//     }
//   }
// }

class MySyncBailHooks {
  constructor() {
    this.taps = [];
  }
  tap(name, handler) {
    this.taps.push({ name, handler });
  }
  call(...args) {
    for (let i = 0; i < this.taps.length; i++) {
      let { handler } = this.taps[i];
      let res = handler(...args);
      if (res !== undefined) break;
    }
  }
}
