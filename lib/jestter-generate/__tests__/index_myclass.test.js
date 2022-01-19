import generate from '../index.js';
test('generate testdata/myclass.js Test ....', () => {
  const filepath = "./testdata/myclass.js";
  const argv = {};
  const result = {
    "filepath": "./testdata/myclass.js",
    "importset": {
      "defaultname": "MyClass",
      "filepath": "./myclass.js",
      "names": [],
    },
    tests: [{
      "kind": "ClassDeclaration",
      "name": "MyClass",
      "params": ["name"],
      "range": "exportdefault",
      "title": "MyClass Test ....",
      "body": [
        {
          "async": false,
          "static": false,
          "kind": "method",
          "name": "classFunc",
          "params": ["argA"],
        },
        {
          "async": false,
          "static": true,
          "kind": "method",
          "name": "classFunc2",
          "params": ["argB"],
        }
      ],
    }
    ]
  };
  expect(generate(filepath,argv)).toEqual(result);
});
