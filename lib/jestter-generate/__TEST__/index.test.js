//data/prepared_JS.dat
import generate from '../index.js';
test('generate testdata/App.js Test ....', () => {
  const filepath1 = "./testdata/App.js";
  const result1 = {
    "filepath": "./testdata/App.js",
    "importset": {
      "defaultname": "App",
      "filepath": "./App.js",
      "names": ["funcname"]
    },
    tests: [{
      "kind": "Function",
      "name": "App",
      "params": [],
      "range": "exportdefault",
      "title": "App Test ...."
    },
    {
      "kind": "ArrowFunction",
      "name": "funcname",
      "params": ["a","b"],
      "range": "export",
      "title": "funcname Test ....",
	    }]
  };
  expect(generate(filepath1)).toEqual(result1);
});
test('generate testdata/App2.js Test ....', () => {
  const filepath2 = "./testdata/App2.js";
  const result2 = {
    "filepath": "./testdata/App2.js",
    "importset": {
      "defaultname": "App",
      "filepath": "./App2.js",
      "names": [
	"funcname",
	"funcname1",
	"funcname2",
	"funcname",
      ],
    },
    tests: [{
      "kind": "Function",
      "name": "App",
      "params": [],
      "range": "exportdefault",
      "title": "App Test ....",
    },
    {
      "kind": "ArrowFunction",
      "name": "funcname",
      "params": ["a","b"],
      "range": "export",
      "title": "funcname Test ....",
    },
    {
      "kind": "Function",
      "name": "App",
      "params": ["argA", "argB"],
      "range": "exportdefault",
      "title": "App Test ....",
    },
    {
      "kind": "FunctionExpression",
      "name": "funcname1",
      "params": ["c", "d"],
      "range": "export",
      "title": "funcname1 Test ....",
    },
    {
      "kind": "Function",
      "name": "funcname2",
      "params": ["e","f"],
      "range": "export",
      "title": "funcname2 Test ....",
    },
    {
      "kind": "ArrowFunction",
      "name": "funcname",
      "params": ["a","b"],
      "range": "export",
      "title": "funcname Test ....",
    }
    ]
  };
  expect(generate(filepath2)).toEqual(result2);
});
