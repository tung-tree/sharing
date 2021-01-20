const less = require('less');

function loader(source) {
  const cb = this.callback;
  less.render(source, (err, { css }) => {
    cb(err, css);
  });
}

module.exports = loader;
