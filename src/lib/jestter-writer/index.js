"use strict";

import fs from "fs";
import path from "path";

export default function writer(testdata, __programroot, argv) {
  vlog(">jestter-writer:writer", argv);
  const jestterConf = setupJestter(__programroot);
  const articles = setupArticles(__programroot, jestterConf);
  const data = makeSentence(testdata, articles, jestterConf, argv);
  const testpath = getTestFilePath(testdata.filepath, jestterConf);
  const message = createFile(testpath, data);
  console.log(message);
}

const getTestFilePath = (filepath, jestterConf) => {
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

const createFile = (testpath, data) => {
  try {
    fs.writeFileSync(testpath, data);
    return `create '${testpath}'`;
  } catch (e) {
    return e;
  }
};

const makeSentence = (
  { filepath, importset, tests },
  articles,
  jestterConf,
  argv
) => {
  const prepared = articles.prepared;
  const importdata = createImport(
    importset,
    searchLocalinTests(tests),
    jestterConf,
    argv
  );
  const testdata = createTest(tests, filepath, articles, argv);
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

const createTest = (tests, filepath, articles, argv) => {
  let datas = [];
  tests.forEach(({ title, name, kind, params, range }) => {
    vlog(" > test '" + range + " " + title + "'", argv);
    let data = "";

    // set title, function
    data += replaceTo(articles.test, range + " " + title, "title");
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

    datas = datas.concat(data);
  });
  return datas.join("\n");
};

const createImport = (
  { defaultname, names, filepath },
  localBoolean,
  jestterConf,
  argv
) => {
  vlog(["createImport:", defaultname, names, filepath, localBoolean], argv);
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

    if (jestterConf.testdir) {
      data += " from '." + filepath + "';";
    } else {
      data += " from '" + filepath + "';";
    }
  }
  vlog(" > import '" + data + "'", argv);
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

/*+
 * make Articles
 * file read './data/[datas].dat'
 */
function setupArticles(__programroot, jestterConf) {
  let articles = {};
  const datas = ["prepared", "test"];
  datas.forEach((key) => {
    try {
      const key2 = key + "_" + jestterConf.kind.toUpperCase();
      const fpath = path.join(__programroot, "data", key2 + ".dat");
      const data = fs.readFileSync(fpath, "utf-8");
      articles[key] = data;
    } catch (e) {
      console.error(e.message);
    }
  });
  return articles;
}

/**
 * read jestter.json
 * assign to jestterConf
 */
function setupJestter(__programroot) {
  let jestterConf = {
    kind: "JS",
    testdir: "__TEST__",
  };
  let jestterJsonPath = path.join(
    path.normalize(__programroot + "/../../"),
    "jestter.json"
  );
  if (!fs.existsSync(jestterJsonPath)) {
    return jestterConf;
  }

  const jsonObj = JSON.parse(fs.readFileSync(jestterJsonPath, "utf-8"));
  jestterConf = { ...jestterConf, ...jsonObj };
  return jestterConf;
}

const vlog = (msg, argv) => {
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
