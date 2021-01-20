const { AsyncSeriesWaterfallHook } = require('tapable');

const series = new AsyncSeriesWaterfallHook(['age']);

console.time('time');

series.tapPromise('1', (age, cb) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(age - 1);
    }, 1000);
  });
});

series.tapPromise('2', (age, cb) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(age - 1);
    }, 1000);
  });
});

series.tapPromise('3', (age, cb) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(age - 1);
    }, 1000);
  });
});

series.promise(30).then(
  (res) => {
    console.timeEnd('time');
    console.log(`promise then result : ${res}`);
  },
  (err) => {
    console.log(`promise then err : ${err}`);
  }
);

// ('use strict');
// var _context;
// var _x = this._x;
// return new Promise(function (_resolve, _reject) {
//   var _sync = true;
//   function _error(_err) {
//     if (_sync)
//       _resolve(
//         Promise.resolve().then(function () {
//           throw _err;
//         })
//       );
//     else _reject(_err);
//   }
//   function _next1() {
//     var _fn2 = _x[2];
//     var _hasResult2 = false;
//     var _promise2 = _fn2(age);
//     if (!_promise2 || !_promise2.then)
//       throw new Error(
//         'Tap function (tapPromise) did not return promise (returned ' +
//           _promise2 +
//           ')'
//       );
//     _promise2.then(
//       function (_result2) {
//         _hasResult2 = true;
//         if (_result2 !== undefined) {
//           age = _result2;
//         }
//         _resolve(age);
//       },
//       function (_err2) {
//         if (_hasResult2) throw _err2;
//         _error(_err2);
//       }
//     );
//   }
//   function _next0() {
//     var _fn1 = _x[1];
//     var _hasResult1 = false;
//     var _promise1 = _fn1(age);

//     if (!_promise1 || !_promise1.then)
//       throw new Error(
//         'Tap function (tapPromise) did not return promise (returned ' +
//           _promise1 +
//           ')'
//       );
//     _promise1.then(
//       function (_result1) {
//         _hasResult1 = true;
//         if (_result1 !== undefined) {
//           age = _result1;
//         }
//         _next1();
//       },
//       function (_err1) {
//         if (_hasResult1) throw _err1;
//         _error(_err1);
//       }
//     );
//   }
//   var _fn0 = _x[0];
//   var _hasResult0 = false;
//   var _promise0 = _fn0(age);
//   if (!_promise0 || !_promise0.then)
//     throw new Error(
//       'Tap function (tapPromise) did not return promise (returned ' +
//         _promise0 +
//         ')'
//     );
//   _promise0.then(
//     function (_result0) {
//       _hasResult0 = true;
//       if (_result0 !== undefined) {
//         age = _result0;
//       }
//       _next0();
//     },
//     function (_err0) {
//       if (_hasResult0) throw _err0;
//       _error(_err0);
//     }
//   );
//   _sync = false;
// });
