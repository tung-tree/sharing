/**
 *
 *   异步并行熔断 hook
 *
 *   通过回调函数是否有返回值来 决定 是否执行下个 订阅函数
 *
 *
 */

const { AsyncParallelBailHook } = require('tapable');

const parallelBail = new AsyncParallelBailHook(['age']);

console.time('test');

parallelBail.tapAsync('zhangsan', (age, cb) => {
  console.log(1);
  setTimeout(() => {
    console.log(`zhangsan ${age}`);
    cb();
  }, 2000);
});

parallelBail.tapAsync('lisi', (age, cb) => {
  console.log(2);
  setTimeout(() => {
    console.log(`lisi ${age}`);
    cb('stop');
  }, 2000);
});

parallelBail.tapAsync('wangwu', (age, cb) => {
  console.log(3);
  setTimeout(() => {
    console.log(`wangwu ${age}`);
    cb();
  }, 2000);
});

parallelBail.callAsync(28, (result) => {
  console.log(result);
  console.timeEnd('test');
});

// var _context;
// var _x = this._x;
// var _results = new Array(3);
// var _checkDone = function () {
//   for (var i = 0; i < _results.length; i++) {
//     var item = _results[i];
//     if (item === undefined) return false;
//     if (item.result !== undefined) {
//       _callback(null, item.result);
//       return true;
//     }
//     if (item.error) {
//       _callback(item.error);
//       return true;
//     }
//   }
//   return false;
// };
// do {
//   var _counter = 3;
//   var _done = function () {
//     _callback();
//   };
//   if (_counter <= 0) break;
//   var _fn0 = _x[0];
//   _fn0(age, function (_err0, _result0) {
//     if (
//       0 < _results.length &&
//       (_result0 !== undefined && (_results.length = 1),
//       (_results[0] = { result: _result0 }),
//       _checkDone())
//     ) {
//       _counter = 0;
//     } else {
//       if (--_counter === 0) _done();
//     }
//   });

//   if (_counter <= 0) break;

//   if (1 >= _results.length) {
//     if (--_counter === 0) _done();
//   } else {
//     var _fn1 = _x[1];
//     _fn1(age, function (_err1, _result1) {
//       if (
//         1 < _results.length &&
//         (_result1 !== undefined && (_results.length = 2),
//         (_results[1] = { result: _result1 }),
//         _checkDone())
//       ) {
//         _counter = 0;
//       } else {
//         if (--_counter === 0) _done();
//       }
//     });
//   }

//   if (_counter <= 0) break;
//   if (2 >= _results.length) {
//     if (--_counter === 0) _done();
//   } else {
//     var _fn2 = _x[2];
//     _fn2(age, function (_err2, _result2) {
//       if (_err2) {
//         if (_counter > 0) {
//           if (
//             2 < _results.length &&
//             ((_results.length = 3),
//             (_results[2] = { error: _err2 }),
//             _checkDone())
//           ) {
//             _counter = 0;
//           } else {
//             if (--_counter === 0) _done();
//           }
//         }
//       } else {
//         if (_counter > 0) {
//           if (
//             2 < _results.length &&
//             (_result2 !== undefined && (_results.length = 3),
//             (_results[2] = { result: _result2 }),
//             _checkDone())
//           ) {
//             _counter = 0;
//           } else {
//             if (--_counter === 0) _done();
//           }
//         }
//       }
//     });
//   }
// } while (false);

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
    let arr = new Array(len);

    const done = () => {
      arr.forEach((res) => {
        if (res === undefined) {
          return false;
        } else {
          finalCallback(res);
        }
      });
    };

    for (let i = 0; i < this.taps.length; i++) {
      this.taps[i].fn(params, (err, res) => {
        if (err) return finalCallback(err);
        arr[i] = { result: res };
        done();
      });
      
      if (i === len - 1) {
        finalCallback(res);
      }
    }
  }
}
