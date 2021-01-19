/**
 *
 *  同步 循环型 hook
 *
 *  只要 执行的 订阅函数 不返回 undefind 的 ，就从头开始遍历执行
 *
 */

const { SyncLoopHook } = require('tapable');

class Test {
  constructor() {
    this.hooks = {
      loop: new SyncLoopHook()
    };
  }
}

var t = new Test();

let i = 0;

t.hooks.loop.tap('zhangsang', (age) => {
  i = i + 1;
  console.log(`${i} 、zhangsang executed`);
});

t.hooks.loop.tap('lisi', (age) => {
  if (i > 5) {
    console.log(`${i} 、lisi executed`);
    return undefined;
  } else {
    return i;
  }
});

t.hooks.loop.tap('wangwu', (age) => {
  console.log(`${i} 、wangwu executed`);
});

t.hooks.loop.call();

// var _context;
// var _x = this._x;
// var _loop;
// do {

//   _loop = false;

//   var _fn0 = _x[0];
//   var _result0 = _fn0();

//   if (_result0 !== undefined) {
//     _loop = true;
//   } else {
//     var _fn1 = _x[1];
//     var _result1 = _fn1();

//     if (_result1 !== undefined) {
//       _loop = true;
//     } else {
//       var _fn2 = _x[2];
//       var _result2 = _fn2();

//       if (_result2 !== undefined) {
//         _loop = true;
//       } else {
//         if (!_loop) {
//         }
//       }
//     }
//   }

// } while (_loop);

class MySyncLoopHook {
  constructor() {
    this.taps = [];
  }
  tap(name, handler) {
    this.taps.push({ name, handler });
  }
  call() {
    let loop = false;
    let i = 0;
    
    const next = () => {
      i = 0;
      execute();
    };

    const execute = () => {
      do {
        let { handler } = this.taps[i];
        let res = handler();
        if (res === undefined) {
          loop = true;
          i = i + 1;
        } else {
          loop = false;
          next();
        }
        if (i === this.taps.length) {
            loop = false
        }
      } while (loop);
    };

    execute();
  }
}
