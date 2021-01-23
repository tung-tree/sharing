const path = require('path');
module.exports = {
  mode: 'development',
  context: '/Users/yanpingli/learn/sharing/webpack/4、ast',
  entry: './loadsh.js',
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              path.resolve(__dirname, 'babel-plugin-import.js'),
              { library: ['lodash'] }
            ]
          }
        }
      }
    ]
  }
};
