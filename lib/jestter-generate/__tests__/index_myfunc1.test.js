import generate from '../index.js';
test('generate testdata/js/myfunc1.js Test ....', () => {
  const filepath = "./testdata/js/myfunc1.js";
  const argv = {};
  const result = {
    "filepath": "./testdata/js/myfunc1.js",
    "importset": {
      "defaultname": "",
      "filepath": "./myfunc1.js",
      "names": [
	"funcname1",
	"funcname2",
	"funcname3",
      ],
    },
    tests: [{
      "ancestors": "ROOT,ExportNamedDeclaration,VariableDeclaration,VariableDeclarator",
      "kind": "FunctionExpression",
      "name": "funcname1",
      "params": ["c", "d"],
      "range": "export",
      "title": "funcname1 Test ....",
      "body": [],
    },
    {
      "ancestors": "ROOT,ExportNamedDeclaration,FunctionDeclaration",
      "kind": "FunctionDeclaration",
      "name": "funcname2",
      "params": ["numbers"],
      "range": "export",
      "title": "funcname2 Test ....",
      "body": [],
    },
    {
      "ancestors": "ROOT,ExportNamedDeclaration,VariableDeclaration,VariableDeclarator",
      "kind": "ArrowFunctionExpression",
      "name": "funcname3",
      "params": ["a","b"],
      "range": "export",
      "title": "funcname3 Test ....",
      "body": [],
    },
    {
      "ancestors": "ROOT,FunctionDeclaration",
      "kind": "FunctionDeclaration",
      "name": "funcname4",
      "params": ["argE","argF"],
      "range": "local",
      "title": "funcname4 Test ....",
      "body": [],
    }
    ]
  };
  expect(generate(filepath,argv)).toEqual(result);
});
