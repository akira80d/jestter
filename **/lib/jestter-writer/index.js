import fs from "fs";
import path from "path";
export function writer() {
  const testdata = {
    filepath: "./hoge4.js",
    imports: [{
      functions: ["fooFunc", "booFunc"],
      filepath: "./hoge4.js"
    }],
    functions: [{
      title: "fooFunc title",
      name: "fooFunc",
      kind: "toBe"
    }, {
      title: "booFunc title",
      name: "booFunc",
      kind: undefined
    }]
  };
  setupArticles();
  const data = makeSentence(testdata);
  const testpath = getTestFilePath(testdata.filepath);
  const str = makeFile(testpath, data);
  console.log(str);
}

const getTestFilePath = filepath => {
  const extname = path.extname(filepath);
  const basename = path.basename(filepath, extname);
  const dirname = path.dirname(filepath);
  return path.join(dirname, basename + ".test" + extname);
};

const makeFile = (testpath, data) => {
  fs.writeFileSync(testpath, data);
  return `create test file '${testpath}'`;
};

const makeSentence = ({
  filepath,
  imports,
  functions
}) => {
  const predata = getArticle("predata");
  const importdata = createImport(imports);
  const testdata = createTest(functions);
  const data = [predata, importdata,, testdata].join("\n");
  return data;
};

const createTest = functions => {
  let datas = [];
  functions.forEach(({
    title,
    name,
    kind
  }) => {
    console.log("create test '" + title + "'");
    let data = "";

    switch (kind) {
      case 'toBe':
        data += replaceTo(getArticle("toBe"), title, "title");
        break;

      default:
        data += replaceTo(getArticle("default"), title, "title");
        break;
    }

    data = replaceTo(data, name, "functionName");
    datas.push(data);
  });
  return datas.join("\n");
};

const createImport = imports => {
  let data = "";
  imports.forEach(({
    functions,
    filepath
  }) => {
    console.log("create imports '" + filepath + "'");
    data += "import {" + functions.join(",") + "} from '" + filepath + "';";
  });
  return data;
};

const replaceTo = (str, arg, argstr) => {
  const searchstr = "${" + argstr + "}";
  return str.replace(searchstr, arg);
};

const getArticle = arg => {
  return articles[arg];
};
/*+
 * make articles
 * file read './data/[datas].dat'
 */


function setupArticles() {
  const datas = ["predata", "toBe", "default"];
  datas.forEach(key => {
    try {
      const data = fs.readFileSync("./data/" + key + ".dat", "utf-8");
      articles[key] = data;
    } catch (e) {
      console.log(e.message);
    }
  });
}

let articles = {};
main();