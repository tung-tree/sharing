/**
 *
 *  https://astexplorer.net/
 *
 *  npm install --save-dev @babel/parser
 *  npm install --save-dev @babel/traverse
 *  npm install --save-dev @babel/generator
 *  npm install --save-dev @babel/types
 *
 */

// @babel/parser 内部就是 babylon
// const babylon = require('babylon')

const fs = require('fs');

const path = require('path');

// 代码解析器 : 通过该模块来解析我们的代码生成AST抽象语法树
const parser = require('@babel/parser');

// AST 遍历器 ：通过该模块来对 AST抽象语法树 进行递归遍历
const traverse = require('@babel/traverse').default;

// AST节点类型： 通过该模块对具体的AST节点进行进行增、删、改、查
const types = require('@babel/types');

// 代码生成器 ： 通过该模块可以 将修改后的AST 生成新的代码
const generate = require('@babel/generator').default;

// 标准化路径
const join = (filename) => path.join(__dirname, filename);

// 读取文件内容 : const test = require('./test.js');
const source = fs.readFileSync(path.join(__dirname, './index.js'), 'utf-8');

// 第一步 ： 转换成 AST
const ast = parser.parse(source, {
  sourceType: 'module'
});

// 第二步： 遍历 AST
traverse(ast, {
  CallExpression(path) {
    const node = path.node;
    // console.log('CallExpression: ', path);
    // console.log('CallExpression node: ', node);
    // console.log('CallExpression callee : ', node.callee.name);
    if (node.callee.name === 'require') {
      // 1、现在要替换 require 为 __webpack_require__
      node.callee.name = '__webpack_require__';

      // 2、现在要替换 相对路径 为 绝对路径
      // 所以我们要改动当前这个 node.arguments , 怎么改 ？ 这个时候 types 来了~~~~~~
      // 进入 https://babeljs.io/docs/en/babel-types 查看 api

      // 拿到相对路径
      const relativePath = node.arguments[0].value;
      // 更换 arguments
      node.arguments = [types.stringLiteral(join(relativePath))];
    }
  }
});

// 第三步： 使用新的AST从新生成code
const { code } = generate(ast);
console.log(code);


// CallExpression
// import(/* webpackChunkName: "share" */ './index.vue')

// ImportDeclaration
// import test from "./test"

