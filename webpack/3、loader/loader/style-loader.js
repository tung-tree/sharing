function loader(source) {
  const script =  `
    const style = document.createElement("style");
    style.innerHTML = ${JSON.stringify(source)};
    document.head.appendChild(style); 
  `;
  return script
}

module.exports = loader;
