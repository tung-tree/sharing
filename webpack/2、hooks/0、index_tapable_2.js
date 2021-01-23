const {
  SyncHook, // 同步hook
  SyncBailHook, // 同步熔断hook
  SyncWaterfallHook, // 同步瀑布hook
  SyncLoopHook, // 同步循环hook
  AsyncParallelHook, // 异步并行hook
  AsyncParallelBailHook, // 异步并行熔断hook

  AsyncSeriesHook, // 异步串行hook
  AsyncSeriesBailHook, // 异步串行熔断hook
  AsyncSeriesWaterfallHook // 异步串行瀑布hook
} = require('tapable');

class Test {
  constructor() {
    this.hooks = {
      syncHook: new SyncHook(['age', 'sex'])
    };
  }
}

const test = new Test();

/**
 * 测试同步hook
 * zhansang 事件标识 ，不能为空
 *
 */
test.hooks.syncHook.tap('zhansang', (a, b) => {
  console.log('zhansang', a, b);
});

test.hooks.syncHook.tap(
  {
    name: 'lisi',
    stage: 1
  },
  (a, b) => {
    console.log('lisi', a, b);
  }
);

test.hooks.syncHook.tap('wangwu', (a, b) => {
  console.log('wangwu', a, b);
});

// 拦截器，其实就是在 fn 的基础之上，包了一层
test.hooks.syncHook.intercept({
  register: (options) => {
    const fn = options.fn;
    options.fn = (...params) => {
      console.log('intercepter executed');
      fn(...params);
    };
    return options;
  }
});

/**
 * 把这个 订阅函数 放到 lisi 前面
 */
test.hooks.syncHook.tap(
  {
    name: 'test',
    before: 'lisi',
    stage: 0
  },
  (a, b) => {
    console.log('test', a, b);
  }
);

test.hooks.syncHook.call('23', 'female');
