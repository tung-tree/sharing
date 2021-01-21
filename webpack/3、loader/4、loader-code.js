let index = 0;

function loader(source) {
  // const callback = this.async 异步
  // this.callback // 内部回调（同步）
  const source = source + 'new';
  return source;
}

/**
 * 熔断作用
 */
loader.pitch = function () {
  if (index > 5) {
    // 有返回值，会终止后面的loader执行，直接直接上一个loader
    return index;
  } else {
    // 返回 undefined 继续执行下个loader
    return undefined;
  }
};

// 表示返回 字符串 ， 否则是 Buffer 流
loader.raw = false
