const { AsyncSeriesWaterfallHook } = require('tapable');

const waterfall = new AsyncSeriesWaterfallHook(['age']);

console.time('time');

waterfall.tapAsync('1', (age, cb) => {
  setTimeout(() => {
    cb(null, age + 1);
  }, 1000);
});

waterfall.tapAsync('2', (age, cb) => {
  setTimeout(() => {
    cb(null, age + 1);
  }, 1000);
});

waterfall.tapAsync('3', (age, cb) => {
  setTimeout(() => {
    cb(null, age + 1);
  }, 1000);
});

waterfall.callAsync(30, (err, res) => {
  console.log(`最后的结果: ${res}`);
  console.timeEnd('time');
});

// var _context;
// var _x = this._x;

// function _next1() {
//   var _fn2 = _x[2];
//   _fn2(age, function (_err2, _result2) {
//     if (_err2) {
//       _callback(_err2);
//     } else {
//       if (_result2 !== undefined) {
//         age = _result2;
//       }
//       _callback(null, age);
//     }
//   });
// }

// function _next0() {
//   var _fn1 = _x[1];
//   _fn1(age, function (_err1, _result1) {
//     if (_err1) {
//       _callback(_err1);
//     } else {
//       if (_result1 !== undefined) {
//         age = _result1;
//       }
//       _next1();
//     }
//   });
// }

// var _fn0 = _x[0];
// _fn0(age, function (_err0, _result0) {
//   if (_err0) {
//     _callback(_err0);
//   } else {
//     if (_result0 !== undefined) {
//       age = _result0;
//     }
//     _next0();
//   }
// });



