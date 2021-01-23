const path = require('path');

// 代码解析器 : 通过该模块来解析我们的代码生成AST抽象语法树
const parser = require('@babel/parser');

// AST 遍历器 ：通过该模块来对 AST抽象语法树 进行递归遍历
const traverse = require('@babel/traverse').default;

// AST节点类型： 通过该模块对具体的AST节点进行进行增、删、改、查
const types = require('@babel/types');

// 代码生成器 ： 通过该模块可以 将修改后的AST 生成新的代码
const generate = require('@babel/generator').default;

const source = `
    import { flatten, concat } from "lodash";
`;

// 第一步 ： 转换成 AST
const ast = parser.parse(source, {
  sourceType: 'module'
});

// import flatten from "lodash/flatten";
// import concat from "lodash/concat";

traverse(ast, {
  ImportDeclaration: {
    enter(path) {
      const specifiers = path.node.specifiers;
      const source = path.node.source;
      // 不是默认 Specifier
      if (!types.isImportDefaultSpecifier(specifiers[0])) {
        const declarations = specifiers.map((specifier, index) => {
          // flatten/lodash
          // concat/lodash
          return types.ImportDeclaration(
            [types.importDefaultSpecifier(specifier.local)],
            types.stringLiteral(`${source.value}/${specifier.local.name}`)
          );
        });
        
        path.replaceWithMultiple(declarations);
      }
    }
  }
});

// 第三步： 使用新的AST从新生成code
const { code } = generate(ast);

console.log(code);
