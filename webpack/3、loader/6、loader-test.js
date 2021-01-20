const fs = require('fs');
const path = require('path');
const { runLoaders } = require('loader-runner');
const join = (filename) => path.join(__dirname, filename);
runLoaders(
  {
    resource: join('./loader/reset.less'),
    loaders: [join('./loader/style-loader'), join('./loader/less-loader')],
    context: {}
  },
  (err, { result }) => {
    fs.writeFileSync(join('./loader/index.js'), result[0], 'utf-8');
  }
);
