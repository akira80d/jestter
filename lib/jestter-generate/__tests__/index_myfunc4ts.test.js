
import generate from '../index.js';

test('exportdefault generate testdata/ts/myfunc4.ts Test ....', () => {
  const filepath = "./testdata/ts/myfunc4.ts";
  const argv = {};
  const result = {
    "filepath": "./testdata/ts/myfunc4.ts",
    "importset": {
      "defaultname": "",
      "filepath": "./myfunc4.ts",
      "names": [],
    },
    tests: [{
      "ancestors": "ROOT,VariableDeclaration,VariableDeclarator",
      "kind": "ArrowFunctionExpression",
      "name": "map",
      "params": ["array","f"],
      "range": "local",
      "title": "map Test ....",
      "body": [],
    },
  ]
  };
  
  expect(generate(filepath,argv)).toStrictEqual(result);
});