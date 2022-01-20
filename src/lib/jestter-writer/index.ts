"use strict";

import fs from "fs";
import path from "path";
import {Test,Importset,Testdata} from "../jestter-generate/types";

type JestterConf = {
    kind: string,
    testdir: string
}

type Articles = {
    prepared: string,
    test: string
}

export default function writer(testdata: Testdata, __programroot:string, argv:any) {
  vlog(">jestter-writer:writer", argv);
  vlog([__programroot, argv], argv);
  const jestterConf:JestterConf = setupJestter(__programroot, argv);
  vlog(["jestterConf:",jestterConf], argv)
  const articles:Articles = setupArticles(__programroot, jestterConf);
  vlog(["articles:",articles], argv)
  const data = makeSentence(testdata, articles, jestterConf, argv);
  vlog(["data:",data], argv)
  const testpath = getTestFilePath(testdata.filepath, jestterConf);
  vlog(["testpath:",testpath], argv)
  const message = createFile(testpath, data);
  console.log(message);
}

const getTestFilePath = (filepath: string, jestterConf: JestterConf) => {
  const extname = path.extname(filepath);
  const basename = path.basename(filepath, extname);
  const dirname = path.dirname(filepath);
  const testdir = path.join(dirname, jestterConf.testdir);
  if (!fs.existsSync(testdir)) {
    fs.mkdirSync(testdir);
  }
  let testfilePath = path.join(testdir, basename + ".test" + extname);
  let i = 2;
  while (fs.existsSync(testfilePath)) {
    testfilePath = path.join(testdir, basename + "_" + i + ".test" + extname);
    i++;
  }
  return testfilePath;
};

const createFile = (testpath: string, data: string) => {
  try {
    fs.writeFileSync(testpath, data);
    return `create '${testpath}'`;
  } catch (e) {
    return e;
  }
};

const makeSentence = (
  { filepath, importset, tests }: Testdata,
  articles: Articles,
  jestterConf: JestterConf,
  argv: any
) => {
  const prepared = articles.prepared;
  const importdata = createImport(
    importset,
    searchLocalinTests(tests),
    jestterConf,
    argv
  );
  const testdata = createTest(tests, filepath, articles, jestterConf, argv);
  const data = [prepared, importdata, , testdata].join("\n");
  return data;
};

/*
 * contain Local function
 * return Boolean
 */
const searchLocalinTests = (tests:Test[]) => {
  for (let i = 0; i < tests.length; i++) {
    let test = tests[i];
    if (test.range == "local") {
      return true;
      break;
    }
  }
  return false;
};

const createTest = (tests: Test[], filepath: string, articles: Articles, jestterConf: JestterConf, argv:any) => {
  let datas: string[] = [];
  tests.forEach(({ title, name, kind, params, range, body }) => {
    vlog([" > test ", title, name, kind, params, range, body], argv);
    let data = "";

    // set title
    data += replaceTo(articles.test, range + " " + title, "title");

    // set variable 
    const declaration = createDeclaration(params, body);
    data = replaceTo(data, declaration, "declaration");

    // set expect
    const expect = returnExpect(kind, name, params, body, jestterConf);
    data = replaceTo(data, expect, "expect");

    // set local rewireapi
    const rewire = createRewireapi(range, name, filepath);
    data = replaceTo(data, rewire, "rewireapi");

    datas = datas.concat(data);
  });
  return datas.join("\n");
};

const returnExpect = (kind: string, name: string, params:string[], body:any, jestterConf: JestterConf) => {
  if(jestterConf.kind == "REACT"){
    let expect = returnOriginalExpect(jestterConf.kind);
    return replaceTo(expect, name, "function");
  }
  if(kind == "ClassDeclaration"){
    // set classExpects
    return returnClassExpects(name, params, body).join("\n");
  }else{
    let expect = returnOriginalExpect(kind);
    // set function expect
    expect = replaceTo(expect, name, "function");
    const expectation = createExpectation(params);
    return replaceTo(expect, expectation, "argument");
  }
}

const returnClassExpects = (name: string, params:string[], body:any) => {
  const instance = "_" + name;
  const _class = `const ${instance} = new ${name}(${params.join(",")});`;
  let expects = [_class];
  for(let i = 0; i < body.length; i++){
    let method = body[i];
    let testFunc = "toBe";
    if (method.static == true){
      expects = expects.concat(`  expect(${name}.${method.name}(${method.params.join(",")})).${testFunc}(result${i+1});`);
    }else{
      expects = expects.concat(`  expect(${instance}.${method.name}(${method.params.join(",")})).${testFunc}(result${i+1});`);
    }
  }
  return expects;
}

const returnOriginalExpect = (kind: string) => {
  if(kind == "REACT"){
    return 'const { getByText } = render(<${function} />);\n\
  const obj = getByText(/Great Test/);\n\
  expect(obj).toHaveTextContent(result);'  
  }else{ //function
    return "expect(${function}(${argument})).toBe(result);"
  }
}


/*
 * create argument and result
 */
const createDeclaration = (params:string[], body:any) => {
  let declaration = "";
  if (params) {
    params.forEach((p) => {
      declaration += "  const " + p + " = undefined;\n";
    });
  }
  if (body){
    for(let i = 0; i < body.length; i++){
      let method = body[i];
      for(let l = 0; l < method.params.length; l++){
        declaration += `  const ${method.params[l]} = undefined;`;
        if(l != method.params.length) declaration += "\n";
      }
    }
  }

  if(body.length > 0){
    for(let i = 1; i <= body.length; i++){
      declaration += `  const result${i} = undefined;`;
      if(i != body.length) declaration += "\n";
    }
  }else{
    declaration += "  const result = undefined;";
  }
  return declaration;
}

const createExpectation = (params: string[]) => {
  if (params){
    return params.join(",");
  }else{
    return "";
  }
}

const createRewireapi = (range: string, name: string, filepath: string) => {
  if (range != "local") return "";
  return "const " + name + " = " + getBasename(filepath) + "RewireAPI.__get__('" + name + "')";
}


const createImport = (
  importset: Importset,
  localBoolean: boolean,
  jestterConf: JestterConf,
  argv: any
) => {
  vlog(["createImport:", importset.defaultname, importset.names, importset.filepath, localBoolean], argv);
  let data = "";
  if (importset.defaultname != "" || importset.names.length > 0) {
    data += "import ";
    //export default
    data += importset.defaultname;

    //export and local
    if (localBoolean) {
      const basename = getBasename(importset.filepath);
      importset.names.push("__RewireAPI__ as " + basename + "RewireAPI");
    }
    if (importset.defaultname != ""  && importset.names.length > 0) data += " ,";
    if (importset.names.length > 0) {
      data += "{" + importset.names.join(",") + "}";
    }

    if (jestterConf.testdir) {
      data += " from '." + importset.filepath + "';";
    } else {
      data += " from '" + importset.filepath + "';";
    }
  }
  vlog(" > import '" + data + "'", argv);
  return data;
};

/*
 * example './aaa/foo.js' -> 'foo'
 */
function getBasename(filepath: string) {
  return path.basename(filepath, path.extname(filepath));
}

/**
 * replace arg, argstr
 * argstr:${functionName}, ${title}, ${argument}, ${declaration}
 */
const replaceTo = (str: string, arg: string, argstr: string) => {
  const searchstr = "${" + argstr + "}";
  return str.replace(searchstr, arg);
};

/*+
 * make Articles
 * file read './data/[datas].dat'
 */
function setupArticles(__programroot: string, jestterConf: JestterConf) {
  let articles:Articles = {
    prepared: readArticlesData("prepared", jestterConf, __programroot),
    test: readArticlesData("test", jestterConf, __programroot)
  };

  return articles;
}

function readArticlesData(article: string, jestterConf: JestterConf, __programroot: string){
  try {
    let key2;
    if(article == "prepared"){
      key2 = article + "_" + jestterConf.kind.toUpperCase();
    }else{
      key2 = article;
    }
    const fpath = path.join(__programroot, "data", key2 + ".dat");
    const data = fs.readFileSync(fpath, "utf-8");
    return data;
  } catch (e:any) {
    console.error(e.message);
    return ""
  }
}

/**
 * read jestter.json
 * assign to jestterConf
 */
function setupJestter(__programroot: string, argv: any) {
  let jestterConf:JestterConf = {
    kind: "JS",
    testdir: "__tests__",
  };

  if(argv.testdir){
    jestterConf = {
      ...jestterConf,
      testdir: argv.testdir
    }
  }
  if(argv.kind){
    jestterConf = {
      ...jestterConf,
      kind: argv.kind.toUpperCase()
    }
  }

  if (!(jestterConf.kind == "JS" || jestterConf.kind == "REACT")){
    console.error("kind need 'JS' or 'REACT'");
  }

  return jestterConf;
}

const vlog = (msg: any, argv: any) => {
  let bool;
  try {
    bool = argv.V;
  } catch {
    return;
  }
  if (bool) {
    console.log(msg);
  }
};
