const fs = require('fs');
const path = require('path');
const { runLoaders } = require('loader-runner');
const join = (filename) => path.join(__dirname, filename);


/**
 * 
 * /Users/yanpingli/learn/sharing/webpack/3、loader/loader/reset.less
 * 
 */
const resource = join('./loader/reset.less');

/**
 * 
 * [
 *    '/Users/yanpingli/learn/sharing/webpack/3、loader/loader/style-loader',
 *    '/Users/yanpingli/learn/sharing/webpack/3、loader/loader/less-loader'
 * ]
 * 
 */
const loaders = [join('./loader/style-loader'), join('./loader/less-loader')];

/**
 * 
 * 自定义上下文参数
 * 
 */
const context = {};

runLoaders(
  {
    resource,
    loaders,
    context
  },
  (err, { result }) => {
    fs.writeFileSync(join('./loader/index.js'), result[0], 'utf-8');
  }
);
