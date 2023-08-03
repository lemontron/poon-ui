import template from '@babel/template';
import generate from '@babel/generator';
import * as t from '@babel/types';

const buildRequire = template(`
  var %%importName%% = require(%%source%%);
`);

const ast = buildRequire({
	importName: t.identifier('myModule'),
	source: t.stringLiteral('my-module'),
});

console.log(generate(ast).code);

