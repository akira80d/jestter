import path from "path";
import { fileURLToPath } from "url";

import writer ,{__RewireAPI__ as indexRewireAPI} from '../index.js';

const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __programroot = path.dirname(path.normalize(__filename + "/../../../"));
console.log(__programroot);

/*
test('local getTestFilePath Test ....', () => {
  const filepath = './testdata/App.js';
  const jestterConf = {kind:"JS", testdir:"__tests__"}
  const result = 'testdata/__tests__/App.test.js';
  const getTestFilePath = writerRewireAPI.__get__('getTestFilePath');
  expect(getTestFilePath(filepath,jestterConf)).toBe(result);
});
*/

/*
test('local makeSentence Test ....', () => {
  const object = {
    filepath: './testdata/myclass.js', 
    importset: { defaultname: 'MyClass', names: [], filepath: './myclass.js' }, 
    tests: [{ 
      title: "MyClass Test ....", 
      name: "MyClass",
      kind: "ClassDeclaration", 
      params: ["name"],
      range: "exportdefault",
      body: [],
    }]
  };
  const setupArticles = indexRewireAPI.__get__('setupArticles')
  const jestterConf = {kind:"JS", testdir:"__tests__"}
  const articles = setupArticles(__programroot,jestterConf);

  const argv = {};
  const result = undefined;
  const makeSentence = indexRewireAPI.__get__('makeSentence')
  expect(makeSentence(object,articles,jestterConf,argv)).toBe(result);
});
*/

/*
test('local searchLocalinTests Test ....', () => {
  const tests = undefined;
  const result = undefined;
  const searchLocalinTests = indexRewireAPI.__get__('searchLocalinTests')
  expect(searchLocalinTests(tests)).toBe(result);
});
*/


test('local createTest Test ....', () => {
  const tests = [{ 
    title: "MyClass Test ....", 
    name: "MyClass",
    kind: "ClassDeclaration", 
    params: ["name"],
    range: "exportdefault",
    body: [],
  }];
  const filepath = './testdata/js/myclass.js';
  const setupArticles = indexRewireAPI.__get__('setupArticles')
  const jestterConf = {kind:"JS", testdir:"__tests__"}
  const articles = setupArticles(__programroot,jestterConf);
  const argv = {};
  const result = "test(' ', () => {\n  const result = undefined;\n\n  expect(()).toBe(result);\n});\n";
  const createTest = indexRewireAPI.__get__('createTest')
  expect(createTest(tests,filepath,articles,argv)).toBe(result);
});


test('local createImport Test ....', () => {
  const object = {
    defaultname: "App",
    names: [],
    filepath: './testdata/js/App.js',
  };
  const localBoolean = true;
  const jestterConf = {kind:"JS", testdir:"__tests__"}
  const argv = {};
  const result =  "import App ,{__RewireAPI__ as AppRewireAPI} from '../testdata/js/App.js';";
  const createImport = indexRewireAPI.__get__('createImport')
  expect(createImport(object,localBoolean,jestterConf,argv)).toBe(result);
});

test('local getBasename Test ....', () => {
  const filepath = './testdata/js/App.js';
  const result = "App";
  const getBasename = indexRewireAPI.__get__('getBasename')
  expect(getBasename(filepath)).toBe(result);
});


/*
test('local replaceTo Test ....', () => {
  const str = "title: ${title} ....";
  const arg = "local testFunc1 title";
  const argstr = "title";
  const result = "title: local testFunc1 title ....";

  const replaceTo = writerRewireAPI.__get__('replaceTo');
  expect(replaceTo(str,arg,argstr)).toBe(result);
});


test('local setupArticles Test ....', () => {
  const jestterConf = {kind:"JS", testdir:"__tests__"}
  const result = {"prepared": "", "test": "test('${title}', () => {\n${declaration}\n  ${rewireapi}\n  expect(${functionName}(${argument})).toBe(result);\n});\n\n"};
  const setupArticles = indexRewireAPI.__get__('setupArticles')
  expect(setupArticles(__programroot,jestterConf)).toEqual(result);
});
*/

test('local setupJestter Test ....', () => {

  const result = {"kind": "JS", "testdir": "__tests__"};
  const setupJestter = indexRewireAPI.__get__('setupJestter')
  expect(setupJestter(__programroot)).toEqual(result);
});

