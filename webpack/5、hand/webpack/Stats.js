class Stats {
  constructor(compilation) {
    this.compilation = compilation;
  }
  toJson() {
    const str = JSON.stringify(this.compilation, null, 2);
    console.log(str);
  }
}

module.exports = Stats
