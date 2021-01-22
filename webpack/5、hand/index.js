const config = require('./config.js');

const webpack = require('./webpack/index.js');

const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
    console.log(err);
  } else {
    console.log('构建完毕');
    console.log(
      stats.toJson()
    );
  }
});
