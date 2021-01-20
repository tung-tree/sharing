/**
 *
 *   异步串行 hook
 *
 *   通过回调函数是否有返回值来 决定 是否执行下个 订阅函数
 *
 *
 */

const { AsyncSeriesHook } = require('tapable');

const series = new AsyncSeriesHook(['age']);

console.time('time');

series.tapAsync('1', (age, cb) => {
  setTimeout(cb, 1000);
});

series.tapAsync('2', (age, cb) => {
  setTimeout(cb, 1000);
});

series.tapAsync('3', (age, cb) => {
  setTimeout(cb, 1000);
});

series.callAsync(30, (err, age) => {
  console.timeEnd('time');
});

// var _context;

// var _x = this._x;

// function _next1() {
//   var _fn2 = _x[2];
//   _fn2(age, function (_err2) {
//     if (_err2) {
//       _callback(_err2);
//     } else {
//       _callback();
//     }
//   });
// }

// function _next0() {
//   var _fn1 = _x[1];
//   _fn1(age, function (_err1) {
//     if (_err1) {
//       _callback(_err1);
//     } else {
//       _next1();
//     }
//   });
// }

// var _fn0 = _x[0];

// _fn0(age, function (_err0) {
//   if (_err0) {
//     _callback(_err0);
//   } else {
//     _next0();
//   }
// });

class My {
  constructor() {
    this.taps = [];
  }
  tapAsync(name, fn) {
    this.taps.push({ name, fn });
  }
  callAsync(params, finalCallback) {
    let i = 0;
    let len = this.taps.length;

    const done = (err, res) => {
      if (err) return finalCallback(err);
      next(++i);
    };

    const next = (i) => {
      if (i === len) {
        finalCallback();
      } else {
        this.taps[i].fn(params, done);
      }
    };

    next(i);
  }
}
