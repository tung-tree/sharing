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

// 代码解析器 : 通过该模块来解析我们的代码生成AST抽象语法树
const parser = require('@babel/parser');

// AST 遍历器 ：通过该模块来对 AST抽象语法树 进行递归遍历
const traverse = require('@babel/traverse').default;

// AST节点类型： 通过该模块对具体的AST节点进行进行增、删、改、查
const types = require('@babel/types');

// 代码生成器 ： 通过该模块可以 将修改后的AST 生成新的代码
const generate = require('@babel/generator').default;

const source = `
    const fn = (name,age) => {
      console.log('hello')
    }
`;

// 第一步 ： 转换成 AST
const ast = parser.parse(source);

// console.log(JSON.stringify(ast, null, 2));

// 访问者模式

const visit = {
  //   enter(path) {
  //     console.log('每个节点访问前都会调用的hook');
  //   },
  VariableDeclaration(path) {
    const node = path.node;
    // 变量声明
    console.log('VariableDeclaration : ', node.kind);
  },
  Identifier(path) {
    // 标识符
    const node = path.node;
    console.log('Identifier : ', node.name);
  },
  ArrowFunctionExpression(path) {
    // 箭头函数
    console.log('ArrowFunctionExpression : (name,age)=> {...}');
  },
  BlockStatement() {
    // 静态代码块
    console.log('BlockStatement: {...}');
  },
  ExpressionStatement() {
    // 表达式块
    console.log('ExpressionStatement: console.log("hello")');
  },
  CallExpression() {
    // 函数表达式
    console.log('CallExpression:  ("hello")');
  },
  MemberExpression() {
    // 成员表达式
    console.log('memberExpression : console.log');
  },
  StringLiteral() {
    // 字符串字面量
    console.log('memberExpression : "hello"');
  }
};

// 遍历 ast 
traverse(ast,visit);
