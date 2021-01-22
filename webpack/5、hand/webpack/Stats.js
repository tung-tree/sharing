class Stats {
  constructor(compilation) {
    this.compilation = compilation;
    this.default = {
      entries: true,
      modules: true,
      chunks: true,
      files: true,
      assets: true
    };
  }
  toJson(config = {}) {
    config = Object.assign({}, config, this.default);
    var minCompilation = {};
    for (let key in config) {  
      if (config[key] && this.compilation[key]) {
        minCompilation[key] = this.compilation[key];
      }
    }
    const str = JSON.stringify(minCompilation, null, 2);
    console.log(str);
  }
}

module.exports = Stats;
