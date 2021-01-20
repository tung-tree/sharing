const config = require('./config.js');
const webpack = require('./webpack');
const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) console.log(err);
  console.log(stats.toJson());
});
