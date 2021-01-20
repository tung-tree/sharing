class Plugin {
  constructor(options) {
    this.options = options;
  }
  applay(compiler) {
    compiler.hooks.done.tap('name', () => {
        /// todo something
    });
  }
}
