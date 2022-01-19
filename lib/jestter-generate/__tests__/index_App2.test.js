import generate from '../index.js';
test('generate testdata/App2.js Test ....', () => {
  const filepath2 = "./testdata/App2.js";
  const argv = {};
  const result2 = {
    "filepath": "./testdata/App2.js",
    "importset": {
      "defaultname": "App",
      "filepath": "./App2.js",
      "names": [
      ],
    },
    tests: [{
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
