function loader(source) {
  console.log('post2');
  return source + ' ==> post2';
}

loader.pitch = function () {
  console.log('post-loader-2-pitch');
};

module.exports = loader;
