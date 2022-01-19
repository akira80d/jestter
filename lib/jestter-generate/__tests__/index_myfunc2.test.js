import generate from '../index.js';
test('generate testdata/myfunc2.js Test ....', () => {
  const filepath = "./testdata/myfunc2.js";
  const argv = {};
  const result = {
    "filepath": "./testdata/myfunc2.js",
    "importset": {
      "defaultname": undefined,
      "filepath": "./myfunc2.js",
      "names": [
	"myfunc",
	"myfunc2",
      ],
    },
    tests: [{
      "kind": "CallExpression->FunctionExpression",
      "name": "myfunc",
      "params": ["a", "b"],
      "range": "export",
      "title": "myfunc Test ....",
      "body": [],
    },
    {
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
