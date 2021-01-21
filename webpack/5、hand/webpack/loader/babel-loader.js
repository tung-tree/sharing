var babel = require('@babel/core');

function loader(source) {
  const cb = this.async();

  babel.transform(
    source,
    {
      // presets: ['@babel/preset-env']
    },
    function (err, { code, ast, map }) {
      cb(err, code, ast, map);
    }
  );
}

module.exports = loader;
