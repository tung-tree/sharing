
class Chunk {
  constructor(chunk) {
    this.files = []
    this.modules = []
    this.name = chunk.name
    this.entryModule = chunk
    this.async = chunk.async
  }
}

module.exports = Chunk