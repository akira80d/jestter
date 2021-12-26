//data/prepared_JS.dat
import generate from '../index.js';
test('generate testdata/App.js Test ....', () => {
  const filepath1 = "./testdata/App.js";
  const result1 = {
    "filepath": "./testdata/App.js",
    "importset": {
      "defaultname": "App",
      "filepath": "./App.js",
      "names": []
    },
    tests: [{
      "kind": "Function",
      "name": "App",
      "params": [],
      "title": "App Test ...."
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
      "names": []
    },
    tests: [{
      "kind": "Function",
      "name": "App",
      "params": ["argA", "argB"],
      "title": "App Test ...."
    }]
  };
  expect(generate(filepath2)).toEqual(result2);
});
