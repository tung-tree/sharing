const { SyncHook } = require('tapable');

class Test {
  constructor() {
    this.hooks = {
      sync: new SyncHook(['age'])
    };
  }
}

var t = new Test();

t.hooks.sync.tap('zhangsang', (age) => {
  console.log(`zhangsang age : ${age}`);
});

t.hooks.sync.tap('lisi', (age) => {
  console.log(`zhangsang age : ${age}`);
});

t.hooks.sync.call(30);


class MySyncHooks {
  constructor() {
    this.taps = [];
  }
  tap(name, handler) {
    this.taps.push({ name, handler });
  }
  call(...args) {
    this.taps.forEach((option) => option.handler(...args));
  }
}

// var _context;
// var _x = this._x;
// var _fn0 = _x[0];
// _fn0(age);
// var _fn1 = _x[1];
// _fn1(age);
