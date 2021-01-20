const path = require('path');
const fs = require('fs');
const { runLoaders } = require('loader-runner');

// 解析资源
const filePath = path.resolve(__dirname, 'loader2', 'test.js');

// 内联请求路径
const request = `inline-loader1!inline-loader2!${filePath}`;

// 获取内联loader数组
const parts = request.replace(/^-?!+/, '').split('!');

// 获取转换资源path
const resource = parts.pop();

// 标准化loader路径
const resolveLoader = (loader) => path.resolve(__dirname, 'loader2', loader);

// inlineLoaders=[inline-loader1绝对路径,inline-loader2绝对路径 ]
const inlineLoaders = parts.map(resolveLoader);

const rules = [
  {
    test: /\.js$/,
    use: ['normal-loader1', 'normal-loader2']
  },
  {
    test: /\.js$/,
    enforce: 'post', //post webpack保证一定是后执行的
    use: ['post-loader1', 'post-loader2']
  },
  {
    test: /\.js$/,
    enforce: 'pre', //一定先执行eslint
    use:['babel-loader']
    // use: ['pre-loader1', 'pre-loader2']
  }
];

let preLoaders = [];
let postLoaders = [];
let normalLoaders = [];

for (let i = 0; i < rules.length; i++) {
  const rule = rules[i];
  if (rule.test.test(resource)) {
    if (rule.enforce == 'pre') {
      // 前置loader
      preLoaders.push(...rule.use);
    } else if (rule.enforce == 'post') {
      // 后置loader
      postLoaders.push(...rule.use);
    } else {
      // 普通loader
      normalLoaders.push(...rule.use);
    }
  }
}

// 标准化 loader path
preLoaders = preLoaders.map(resolveLoader);

postLoaders = postLoaders.map(resolveLoader);

normalLoaders = normalLoaders.map(resolveLoader);

let loaders = [];

if (request.startsWith('!!')) {
  // 只要 内联 loader
  loaders = [, ...inlineLoaders];
} else if (request.startsWith('!')) {
  // 不用 normal loader
  loaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
} else if (request.startsWith('-!')) {
  // 不要 pre loader 、normal loader
  loaders = [...postLoaders, ...inlineLoaders];
} else {
  // 所有 loader
  loaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
}

// console.log(loaders);

/**
 * 1.读取要加载的资源
 * 2.把资源传递给loader链条，一一处理，最后得到结果
 */
runLoaders(
  {
    //要加载和转换的资源 可以包含查询字符串
    resource,
    //loader的绝对路径数组
    loaders,
    //基础的loader上下文对象
    context: { name: 'test' },
    //读取文件的方法
    readResource: fs.readFile.bind(fs)
  },
  function (err, { result }) {
    if (err) {
      console.log();
    } else {
      console.log(result[0]);
    }
  }
);
