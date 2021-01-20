
const fs = require('fs');
const path = require('path');
const { runLoaders } = require('loader-runner');
const resolve = (filename) => path.resolve(__dirname, filename);
runLoaders(
  {
    resource: resolve('./loader/reset.less'),
    loaders: [
      resolve('./loader/style-loader'),
      resolve('./loader/less-loader')
    ],
    context: {}
  },
  (err, { result }) => {
    fs.writeFileSync(resolve(__dirname, './loader/index.js'), result[0], 'utf-8');
  }
);
