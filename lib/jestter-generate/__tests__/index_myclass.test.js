import generate from '../index.js';
test('generate testdata/js/myclass.js Test ....', () => {
  const filepath = "./testdata/js/myclass.js";
  const argv = {};
  const result = {
    "filepath": "./testdata/js/myclass.js",
    "importset": {
      "defaultname": "MyClass",
      "filepath": "./myclass.js",
      "names": [],
    },
    tests: [{
      "ancestors": "ROOT,ExportDefaultDeclaration,ClassDeclaration",
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
