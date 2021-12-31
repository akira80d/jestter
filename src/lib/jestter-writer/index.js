"use strict";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let JESTTER = {
  kind: "JS",
  testdir: "__TEST__",
};
let Articles = {};

const __filename = fileURLToPath(import.meta.url);
const __programroot = path.dirname(path.normalize(__filename + "/../../"));

const debug = process.argv[2] == "-d" ? true : false;

export default function writer(testdata) {
  debuglog(">jestter-writer:writer");
  JESTTER = setupJestter();
  setupArticles();
  const data = makeSentence(testdata);
  const testpath = getTestFilePath(testdata.filepath);
  const message = createFile(testpath, data);
  console.log(message);
}

const getTestFilePath = (filepath) => {
  const extname = path.extname(filepath);
  const basename = path.basename(filepath, extname);
  const dirname = path.dirname(filepath);
  const testdir = path.join(dirname, JESTTER.testdir);
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

const createFile = (testpath, data) => {
  try {
    fs.writeFileSync(testpath, data);
    return `create '${testpath}'`;
  } catch (e) {
    return e;
  }
};

const makeSentence = ({ filepath, importset, tests }) => {
  const prepared = getArticle("prepared");
  const importdata = createImport(importset, searchLocalinTests(tests));
  const testdata = createTest(tests, filepath);
  const data = [prepared, importdata, , testdata].join("\n");
  return data;
};

/*
 * contain Local function
 * return Boolean
 */
const searchLocalinTests = (tests) => {
  for (let i = 0; i < tests.length; i++) {
    let test = tests[i];
    if (test.range == "local") {
      return true;
      break;
    }
  }
  return false;
};

const createTest = (tests, filepath) => {
  let datas = [];
  tests.forEach(({ title, name, kind, params, range }) => {
    debuglog("create test '" + range + " " + title + "'");
    let data = "";

    // set title, function
    data += replaceTo(getArticle("test"), range + " " + title, "title");
    data = replaceTo(data, name, "functionName");

    // variable declaration
    if (params) {
      let declaration = "";
      params.forEach((p) => {
        declaration += "  const " + p + " = undefined;\n";
      });
      declaration += "  const result = undefined;";
      data = replaceTo(data, declaration, "declaration");
      data = replaceTo(data, params.join(","), "argument");
    } else {
      let declaration = "  const result = undefined;";
      data = replaceTo(data, declaration, "declaration");
      data = replaceTo(data, "", "argument");
    }

    // local rewireapi
    if (range != "local") {
      data = replaceTo(data, "", "rewireapi");
    } else {
      const rewire =
        "const " +
        name +
        " = " +
        getBasename(filepath) +
        "RewireAPI.__get__('" +
        name +
        "')";
      data = replaceTo(data, rewire, "rewireapi");
    }

    datas.push(data);
  });
  return datas.join("\n");
};

const createImport = ({ defaultname, names, filepath }, localBoolean) => {
  debuglog(["createImport:", defaultname, names, filepath, localBoolean]);
  let data = "";
  if (defaultname || names.length > 0) {
    data += "import ";
    //export default
    data += defaultname ? defaultname : "";

    //export and local
    if (localBoolean) {
      const basename = getBasename(filepath);
      names.push("__RewireAPI__ as " + basename + "RewireAPI");
    }
    if (defaultname && names.length > 0) data += " ,";
    if (names.length > 0) {
      data += "{" + names.join(",") + "}";
    }

    if (JESTTER.testdir) {
      data += " from '." + filepath + "';";
    } else {
      data += " from '" + filepath + "';";
    }
  }
  debuglog("create import '" + data + "'");
  return data;
};

/*
 * example './aaa/foo.js' -> 'foo'
 */
function getBasename(filepath) {
  return path.basename(filepath, path.extname(filepath));
}

/**
 * replace arg, argstr
 * argstr:${functionName}, ${title}, ${argument}, ${declaration}
 */
const replaceTo = (str, arg, argstr) => {
  const searchstr = "${" + argstr + "}";
  return str.replace(searchstr, arg);
};

const getArticle = (arg) => {
  return Articles[arg];
};

/*+
 * make Articles
 * file read './data/[datas].dat'
 */
function setupArticles() {
  const datas = ["prepared", "test"];
  datas.forEach((key) => {
    try {
      //const key2 =
      //  key == "prepared" ? key + "_" + JESTTER.kind.toUpperCase() : key;
      const key2 = key + "_" + JESTTER.kind.toUpperCase();
      const fpath = path.join(__programroot, "data", key2 + ".dat");
      const data = fs.readFileSync(fpath, "utf-8");
      Articles[key] = data;
    } catch (e) {
      console.error(e.message);
    }
  });
}

/**
 * read jestter.json
 * assign to JESTTER
 */
function setupJestter() {
  let jestterJsonPath = path.join(
    path.normalize(__programroot + "/../../"),
    "jestter.json"
  );
  if (!fs.existsSync(jestterJsonPath)) {
    return JESTTER;
  }

  const jsonObj = JSON.parse(fs.readFileSync(jestterJsonPath, "utf-8"));
  JESTTER = { ...JESTTER, ...jsonObj };
  return JESTTER;
}

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
      range: "export",
    },
    {
      title: "testFunc2 title",
      name: "testFunc2",
      kind: undefined,
      params: [],
      range: "local",
    },
  ],
};

const debuglog = (msg) => {
  if (debug) {
    console.log(msg);
  }
};

//writer(testdata2);
