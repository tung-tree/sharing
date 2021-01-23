var babel = require('@babel/core');

function loader(source) {
  const cb = this.async();

  babel.transform(
    source,
    {
      presets: ['@babel/preset-env'],
      caller: {
        name: 'babel-loader',
        target: 'web',
        supportsStaticESM: true,
        supportsDynamicImport: true,
        supportsTopLevelAwait: true
      }
    },
    function (err, { code, ast, map }) {
      cb(err, code, ast, map);
    }
  );
}

module.exports = loader;
