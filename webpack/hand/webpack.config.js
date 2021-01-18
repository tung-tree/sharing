module.exports = {
  context: process.cwd(),
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /.sass$/,
        use: ['style-loader', 'sass-loader']
      }
    ]
  }
};
