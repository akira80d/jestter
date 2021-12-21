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
  const message = makeFile(testpath, data);
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

const makeFile = (testpath, data) => {
  try {
    fs.writeFileSync(testpath, data);
    return `create '${testpath}'`;
  } catch (e) {
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
    //TODO kind is not used
    // kind need REACT/JS (Function/default)
    /*
    switch (kind) {
      case "Function":
        data += replaceTo(getArticle("Function"), title, "title");
        break;
      default:
        data += replaceTo(getArticle("default"), title, "title");
        break;
    }*/
    data += replaceTo(getArticle("test"), title, "title");
    data = replaceTo(data, name, "functionName");
    if (params) {
      let declaration = "";
      params.forEach((p) => {
        declaration += "  const " + p + " = undefined;\n";
      });
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
    if (JESTTER.testdir) {
      data += " from '." + filepath + "';";
    } else {
      data += " from '" + filepath + "';";
    }
  }
  debuglog("create import '" + data + "'");
  return data;
};

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
