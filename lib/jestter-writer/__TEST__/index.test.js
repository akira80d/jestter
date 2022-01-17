//data/prepared_JS.dat
import writer from '../index.js';
import { __RewireAPI__ as writerRewireAPI } from '../index.js'
/*
test('exportdefault writer Test ....', () => {
  const testdata = {
	  filepath: "./test.js",
	importset: {
	  defaultname: "App",
	  names: ["testFunc1", "testFunc"],
	  filepath: "./test.js"
	},
	tests: [{
	  title: "testFunc1 title",
	  name: "testFunc1",
	  kind: "Function",
	  params: ["paramA", "paramB"]
	}]
  };
  const result = undefined;

  expect(writer(testdata)).toBe(result);
});
*/

test('local getTestFilePath Test ....', () => {
  const filepath = './testdata/App.js';
  const result = 'testdata/__TEST__/App.test.js';
  const jestterConf = {kind:"JS", testdir:"__TEST__"}

  const getTestFilePath = writerRewireAPI.__get__('getTestFilePath');
  expect(getTestFilePath(filepath,jestterConf)).toBe(result);
});

/*
test('local createFile Test ....', () => {
  const testpath = undefined;
  const data = undefined;
  const result = undefined;

  expect(createFile(testpath,data)).toBe(result);
});
*/
/*
test('local makeSentence Test ....', () => {

  const filepath = "./test.js";
  const importset = {
	  defaultname: "App",
	  names: ["testFunc1", "testFunc"],
	  filepath: "./test.js"
  };
  const tests = [{
	  title: "testFunc1 title",
	  name: "testFunc1",
	  kind: "Function",
	  params: ["paramA", "paramB"],
	  range: "local"
  }];
  const result = undefined;

  const makeSentence = writerRewireAPI.__get__('makeSentence');
  expect(makeSentence({filepath, importset, tests})).toBe(result);
});
*/

	  /*
test('local createTest Test ....', () => {
  const tests = [{
	  title: "testFunc1 title",
	  name: "testFunc1",
	  kind: "Function",
	  params: ["paramA", "paramB"],
	  range: "local"
  }];
  const result = undefined;

  const createTest = writerRewireAPI.__get__('createTest');
  expect(createTest(tests)).toBe(result);
});*/


test('local replaceTo Test ....', () => {
  const str = "title: ${title} ....";
  const arg = "local testFunc1 title";
  const argstr = "title";
  const result = "title: local testFunc1 title ....";

  const replaceTo = writerRewireAPI.__get__('replaceTo');
  expect(replaceTo(str,arg,argstr)).toBe(result);
});


/*
test('local getArticle Test ....', () => {
  const arg = undefined;
  const result = undefined;

  expect(getArticle(arg)).toBe(result);
});


test('local setupArticles Test ....', () => {
  const result = undefined;

  expect(setupArticles()).toBe(result);
});


test('local setupJestter Test ....', () => {
  const result = undefined;

  expect(setupJestter()).toBe(result);
});


*/
