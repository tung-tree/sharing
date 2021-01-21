const path = require('path')

module.exports = {
  context: '/Users/yanpingli/learn/sharing/webpack/',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: ['babel-loader']
      }
    ]
  }
};
