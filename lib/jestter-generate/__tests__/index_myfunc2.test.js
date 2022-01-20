import generate from '../index.js';
test('generate testdata/js/myfunc2.js Test ....', () => {
  const filepath = "./testdata/js/myfunc2.js";
  const argv = {};
  const result = {
    "filepath": "./testdata/js/myfunc2.js",
    "importset": {
      "defaultname": "",
      "filepath": "./myfunc2.js",
      "names": [
	"myfunc",
	"myfunc2",
      ],
    },
    tests: [{
      "ancestors": "ROOT,ExportNamedDeclaration,VariableDeclaration,VariableDeclarator",
      "kind": "CallExpression->FunctionExpression",
      "name": "myfunc",
      "params": ["a", "b"],
      "range": "export",
      "title": "myfunc Test ....",
      "body": [],
    },
    {
      "ancestors": "ROOT,ExportNamedDeclaration,VariableDeclaration,VariableDeclarator", 
      "kind": "CallExpression->FunctionExpression",
      "name": "myfunc2",
      "params": ["a","b"],
      "range": "export",
      "title": "myfunc2 Test ....",
      "body": [],
    }
    ]
  };
  expect(generate(filepath,argv)).toEqual(result);
});
