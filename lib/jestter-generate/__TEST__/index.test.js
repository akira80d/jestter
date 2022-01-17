import generate from '../index.js';
test('generate testdata/App.js Test ....', () => {
  const filepath1 = "./testdata/App.js";
  const argv = {};
  const result1 = {
    "filepath": "./testdata/App.js",
    "importset": {
      "defaultname": "App",
      "filepath": "./App.js",
      "names": []
    },
    tests: [{
      "kind": "FunctionDeclaration",
      "name": "App",
      "params": [],
      "range": "exportdefault",
      "title": "App Test ...."
    }]
  };
  expect(generate(filepath1, argv)).toEqual(result1);
});
