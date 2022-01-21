import generate from '../index.js';
test('generate testdata/react/App2.js Test ....', () => {
  const filepath2 = "./testdata/react/App2.js";
  const argv = {};
  const result2 = {
    "filepath": "./testdata/react/App2.js",
    "importset": {
      "defaultname": "App",
      "filepath": "./App2.js",
      "names": [
      ],
    },
    tests: [{
      "ancestors": "ROOT,ExportDefaultDeclaration,FunctionDeclaration",
      "kind": "FunctionDeclaration",
      "name": "App",
      "params": ["argA","argB"],
      "range": "exportdefault",
      "title": "App Test ....",
      "body": [],
    }
    ]
  };
  expect(generate(filepath2,argv)).toEqual(result2);
});
