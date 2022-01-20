import generate from '../index.js';
test('generate testdata/react/App.js Test ....', () => {
  const filepath1 = "./testdata/react/App.js";
  const argv = {};
  const result1 = {
    "filepath": "./testdata/react/App.js",
    "importset": {
      "defaultname": "App",
      "filepath": "./App.js",
      "names": []
    },
    tests: [{
      "ancestors": "ROOT,FunctionDeclaration",
      "kind": "FunctionDeclaration",
      "name": "App",
      "params": [],
      "range": "exportdefault",
      "title": "App Test ....",
      "body": [],
    }]
  };
  expect(generate(filepath1, argv)).toEqual(result1);
});
