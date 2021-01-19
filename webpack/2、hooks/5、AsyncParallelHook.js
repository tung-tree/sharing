/**
 *
 * 异步并行 hook 
 * 
 *  其实就是 promise.all . 当然也支持 tap , call 这时就等同于同步
 * 
 *
 */

const { AsyncParallelHook } = require('tapable');

const paralle = new AsyncParallelHook(['age']);

console.time('test');

paralle.tapAsync('zhangsan', (age, cb) => {
  setTimeout(() => {
    console.log(`zhangsan ${age}`);
    cb();
  }, 2000);
});

paralle.tapAsync('lisi', (age, cb) => {
  setTimeout(() => {
    console.log(`lisi ${age}`);
    cb();
  }, 2000);
});

paralle.callAsync(28, () => {
  // 最终的回调
  console.timeEnd('test');
});

// var _context;
// var _x = this._x;

// do {
//   var _counter = 2;

//   var _done = function () {
//     _callback();
//   };

//   if (_counter <= 0) break;

//   var _fn0 = _x[0];

//   _fn0(age, function (_err0) {
//     if (_err0) {
//       if (_counter > 0) {
//         _callback(_err0);
//         _counter = 0;
//       }
//     } else {
//       if (--_counter === 0) _done();
//     }
//   });

//   if (_counter <= 0) break;

//   var _fn1 = _x[1];

//   _fn1(age, function (_err1) {
//     if (_err1) {
//       if (_counter > 0) {
//         _callback(_err1);
//         _counter = 0;
//       }
//     } else {
//       if (--_counter === 0) _done();
//     }
//   });
// } while (false);

// 其实就是 Promise.all

class My {
  constructor() {
    this.taps = [];
  }
  tapAsync(name, fn) {
    this.taps.push({ name, fn });
  }
  callAsync(params, cb) {
    let len = this.taps.length;

    const done = () => {
      if (len === 0) {
        cb();
      } else {
        len = len - 1;
      }
    };

    this.taps.forEach((fn) => {
      fn(params, done);
    });
  }
}
