"use strict";

import fs from "fs";
import path from "path";

const debug = process.argv[2] == "-d" ? true : false;

export default function writer(testdata) {
  debuglog(">jestter-writer:writer");
  setupArticles();
  const data = makeSentence(testdata);
  const testpath = getTestFilePath(testdata.filepath);
  const message = makeFile(testpath, data);
  console.log(message);
}

const getTestFilePath = (filepath) => {
  const extname = path.extname(filepath);
  const basename = path.basename(filepath, extname);
  const dirname = path.dirname(filepath);
  return path.join(dirname, basename + ".test" + extname);
};

const makeFile = (testpath, data) => {
  try {
    fs.writeFileSync(testpath, data);
    return `create '${testpath}'`;
  }catch(e){
    return e;
  }
};

const makeSentence = ({ filepath, importset, tests }) => {
  const prepared = getArticle("prepared");
  const importdata = createImport(importset);
  const testdata = createTest(tests);
  const data = [prepared, importdata, , testdata].join("\n");
  return data;
};

const createTest = (tests) => {
  let datas = [];
  tests.forEach(({ title, name, kind, params }) => {
    debuglog("create test '" + title + "'");
    let data = "";
    switch (kind) {
      case "Function":
        data += replaceTo(getArticle("Function"), title, "title");
        break;
      default:
        data += replaceTo(getArticle("default"), title, "title");
        break;
    }
    data = replaceTo(data, name, "functionName");
    if(params){
      let declaration = "";
      params.forEach(p => {
	      declaration += "  const " + p + " = undefined;\n"
      })
      data = replaceTo(data, declaration, "declaration");
      data = replaceTo(data, params.join(","), "argument");
    }
    datas.push(data);
  });
  return datas.join("\n");
};

const createImport = ({ defaultname, names, filepath }) => {
  let data = "";
  if (defaultname || names.length > 0) {
    data += "import ";
    data += defaultname ? defaultname : "";
    data += names.length > 0 ? "{" + names.join(",") + "}" : "";
    data += " from '" + filepath + "';";
  }
  debuglog("create import '" + data + "'");
  return data;
};

const replaceTo = (str, arg, argstr) => {
  const searchstr = "${" + argstr + "}";
  return str.replace(searchstr, arg);
};

const getArticle = (arg) => {
  return articles[arg];
};

/*+
 * make articles
 * file read './data/[datas].dat'
 */
function setupArticles() {
  const datas = ["prepared", "Function", "default"];
  datas.forEach((key) => {
    try {
      const data = fs.readFileSync("./data/" + key + ".dat", "utf-8");
      articles[key] = data;
    } catch (e) {
      console.error(e.message);
    }
  });
}

let articles = {};

const testdata2 = {
  filepath: "./test.js",
  importset: {
    defaultname: "App",
    names: ["testFunc1", "testFunc2"],
    filepath: "./test.js",
  },
  tests: [
    {
      title: "testFunc1 title",
      name: "testFunc1",
      kind: "Function",
      params: ["paramA", "paramB"],
    },
    {
      title: "testFunc2 title",
      name: "testFunc2",
      kind: undefined,
    },
  ],
};

const debuglog = (msg) => {
  if (debug) {
    console.log(msg);
  }
};

//writer(testdata2);
