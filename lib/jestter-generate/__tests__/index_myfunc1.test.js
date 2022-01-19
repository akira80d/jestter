import generate from '../index.js';
test('generate testdata/myfunc1.js Test ....', () => {
  const filepath = "./testdata/myfunc1.js";
  const argv = {};
  const result = {
    "filepath": "./testdata/myfunc1.js",
    "importset": {
      "defaultname": undefined,
      "filepath": "./myfunc1.js",
      "names": [
	"funcname1",
	"funcname2",
	"funcname3",
      ],
    },
    tests: [{
      "kind": "FunctionExpression",
      "name": "funcname1",
      "params": ["c", "d"],
      "range": "export",
      "title": "funcname1 Test ....",
      "body": [],
    },
    {
      "kind": "FunctionDeclaration",
      "name": "funcname2",
      "params": ["numbers"],
      "range": "export",
      "title": "funcname2 Test ....",
      "body": [],
    },
    {
      "kind": "ArrowFunctionExpression",
      "name": "funcname3",
      "params": ["a","b"],
      "range": "export",
      "title": "funcname3 Test ....",
      "body": [],
    },
    {
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
