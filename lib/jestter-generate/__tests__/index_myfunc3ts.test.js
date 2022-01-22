
import generate from '../index.js';

test('exportdefault generate testdata/ts/myfunc3.ts Test ....', () => {
  const filepath = "./testdata/ts/myfunc3.ts";
  const argv = {};
  const result = {
    "filepath": "./testdata/ts/myfunc3.ts",
    "importset": {
      "defaultname": "",
      "filepath": "./myfunc3.ts",
      "names": [],
    },
    tests: [{
      "ancestors": "ROOT,VariableDeclaration,VariableDeclarator",
      "kind": "ArrowFunctionExpression",
      "name": "funcA",
      "params": ["a","b"],
      "range": "local",
      "title": "funcA Test ....",
      "body": [],
    },
  ]
  };
  
  expect(generate(filepath,argv)).toEqual(result);
});