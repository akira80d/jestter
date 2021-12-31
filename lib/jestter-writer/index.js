"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = void 0;
exports.__set__ = exports.__Rewire__ = _set__;
exports.__GetDependency__ = exports.__get__ = _get__;
exports.default = writer;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _url = require("url");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let JESTTER = {
  kind: "JS",
  testdir: "__TEST__"
};
let Articles = {};

const _filename = _get__("fileURLToPath")(import.meta.url);

const __programroot = _get__("path").dirname(_get__("path").normalize(_get__("__filename") + "/../../"));

const debug = process.argv[2] == "-d" ? true : false;

function writer(testdata) {
  _get__("debuglog")(">jestter-writer:writer");

  _assign__("JESTTER", _get__("setupJestter")());

  _get__("setupArticles")();

  const data = _get__("makeSentence")(testdata);

  const testpath = _get__("getTestFilePath")(testdata.filepath);

  const message = _get__("createFile")(testpath, data);

  console.log(message);
}

const getTestFilePath = filepath => {
  const extname = _get__("path").extname(filepath);

  const basename = _get__("path").basename(filepath, extname);

  const dirname = _get__("path").dirname(filepath);

  const testdir = _get__("path").join(dirname, _get__("JESTTER").testdir);

  if (!_get__("fs").existsSync(testdir)) {
    _get__("fs").mkdirSync(testdir);
  }

  let testfilePath = _get__("path").join(testdir, basename + ".test" + extname);

  let i = 2;

  while (_get__("fs").existsSync(testfilePath)) {
    testfilePath = _get__("path").join(testdir, basename + "_" + i + ".test" + extname);
    i++;
  }

  return testfilePath;
};

const createFile = (testpath, data) => {
  try {
    _get__("fs").writeFileSync(testpath, data);

    return `create '${testpath}'`;
  } catch (e) {
    return e;
  }
};

const makeSentence = ({
  filepath,
  importset,
  tests
}) => {
  const prepared = _get__("getArticle")("prepared");

  const importdata = _get__("createImport")(importset, _get__("searchLocalinTests")(tests));

  const testdata = _get__("createTest")(tests, filepath);

  const data = [prepared, importdata,, testdata].join("\n");
  return data;
};
/*
 * contain Local function
 * return Boolean
 */


const searchLocalinTests = tests => {
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
  tests.forEach(({
    title,
    name,
    kind,
    params,
    range
  }) => {
    _get__("debuglog")("create test '" + range + " " + title + "'");

    let data = ""; // set title, function

    data += _get__("replaceTo")(_get__("getArticle")("test"), range + " " + title, "title");
    data = _get__("replaceTo")(data, name, "functionName"); // variable declaration

    if (params) {
      let declaration = "";
      params.forEach(p => {
        declaration += "  const " + p + " = undefined;\n";
      });
      declaration += "  const result = undefined;";
      data = _get__("replaceTo")(data, declaration, "declaration");
      data = _get__("replaceTo")(data, params.join(","), "argument");
    } else {
      let declaration = "  const result = undefined;";
      data = _get__("replaceTo")(data, declaration, "declaration");
      data = _get__("replaceTo")(data, "", "argument");
    } // local rewireapi


    if (range != "local") {
      data = _get__("replaceTo")(data, "", "rewireapi");
    } else {
      const rewire = "const " + name + " = " + _get__("getBasename")(filepath) + "RewireAPI.__get__('" + name + "')";
      data = _get__("replaceTo")(data, rewire, "rewireapi");
    }

    datas.push(data);
  });
  return datas.join("\n");
};

const createImport = ({
  defaultname,
  names,
  filepath
}, localBoolean) => {
  _get__("debuglog")(["createImport:", defaultname, names, filepath, localBoolean]);

  let data = "";

  if (defaultname || names.length > 0) {
    data += "import "; //export default

    data += defaultname ? defaultname : ""; //export and local

    if (localBoolean) {
      const basename = _get__("getBasename")(filepath);

      names.push("__RewireAPI__ as " + basename + "RewireAPI");
    }

    if (defaultname && names.length > 0) data += " ,";

    if (names.length > 0) {
      data += "{" + names.join(",") + "}";
    }

    if (_get__("JESTTER").testdir) {
      data += " from '." + filepath + "';";
    } else {
      data += " from '" + filepath + "';";
    }
  }

  _get__("debuglog")("create import '" + data + "'");

  return data;
};
/*
 * example './aaa/foo.js' -> 'foo'
 */


function getBasename(filepath) {
  return _get__("path").basename(filepath, _get__("path").extname(filepath));
}
/**
 * replace arg, argstr
 * argstr:${functionName}, ${title}, ${argument}, ${declaration}
 */


const replaceTo = (str, arg, argstr) => {
  const searchstr = "${" + argstr + "}";
  return str.replace(searchstr, arg);
};

const getArticle = arg => {
  return _get__("Articles")[arg];
};
/*+
 * make Articles
 * file read './data/[datas].dat'
 */


function setupArticles() {
  const datas = ["prepared", "test"];
  datas.forEach(key => {
    try {
      //const key2 =
      //  key == "prepared" ? key + "_" + JESTTER.kind.toUpperCase() : key;
      const key2 = key + "_" + _get__("JESTTER").kind.toUpperCase();

      const fpath = _get__("path").join(_get__("__programroot"), "data", key2 + ".dat");

      const data = _get__("fs").readFileSync(fpath, "utf-8");

      _get__("Articles")[key] = data;
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
  let jestterJsonPath = _get__("path").join(_get__("path").normalize(_get__("__programroot") + "/../../"), "jestter.json");

  if (!_get__("fs").existsSync(jestterJsonPath)) {
    return _get__("JESTTER");
  }

  const jsonObj = JSON.parse(_get__("fs").readFileSync(jestterJsonPath, "utf-8"));

  _assign__("JESTTER", { ..._get__("JESTTER"),
    ...jsonObj
  });

  return _get__("JESTTER");
}

const testdata2 = {
  filepath: "./test.js",
  importset: {
    defaultname: "App",
    names: ["testFunc1", "testFunc2"],
    filepath: "./test.js"
  },
  tests: [{
    title: "testFunc1 title",
    name: "testFunc1",
    kind: "Function",
    params: ["paramA", "paramB"],
    range: "export"
  }, {
    title: "testFunc2 title",
    name: "testFunc2",
    kind: undefined,
    params: [],
    range: "local"
  }]
};

const debuglog = msg => {
  if (_get__("debug")) {
    console.log(msg);
  }
}; //writer(testdata2);


function _getGlobalObject() {
  try {
    if (!!global) {
      return global;
    }
  } catch (e) {
    try {
      if (!!window) {
        return window;
      }
    } catch (e) {
      return this;
    }
  }
}

;
var _RewireModuleId__ = null;

function _getRewireModuleId__() {
  if (_RewireModuleId__ === null) {
    let globalVariable = _getGlobalObject();

    if (!globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__) {
      globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__ = 0;
    }

    _RewireModuleId__ = __$$GLOBAL_REWIRE_NEXT_MODULE_ID__++;
  }

  return _RewireModuleId__;
}

function _getRewireRegistry__() {
  let theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__) {
    theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
  }

  return theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__;
}

function _getRewiredData__() {
  let moduleId = _getRewireModuleId__();

  let registry = _getRewireRegistry__();

  let rewireData = registry[moduleId];

  if (!rewireData) {
    registry[moduleId] = Object.create(null);
    rewireData = registry[moduleId];
  }

  return rewireData;
}

(function registerResetAll() {
  let theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable['__rewire_reset_all__']) {
    theGlobalVariable['__rewire_reset_all__'] = function () {
      theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
    };
  }
})();

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
let _RewireAPI__ = {};
exports.__RewireAPI__ = _RewireAPI__;

(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }

  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
  let rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _get_original__(variableName);
  } else {
    var value = rewireData[variableName];

    if (value === INTENTIONAL_UNDEFINED) {
      return undefined;
    } else {
      return value;
    }
  }
}

function _get_original__(variableName) {
  switch (variableName) {
    case "fileURLToPath":
      return _url.fileURLToPath;

    case "path":
      return _path.default;

    case "__filename":
      return _filename;

    case "debuglog":
      return debuglog;

    case "JESTTER":
      return JESTTER;

    case "setupJestter":
      return setupJestter;

    case "setupArticles":
      return setupArticles;

    case "makeSentence":
      return makeSentence;

    case "getTestFilePath":
      return getTestFilePath;

    case "createFile":
      return createFile;

    case "fs":
      return _fs.default;

    case "getArticle":
      return getArticle;

    case "createImport":
      return createImport;

    case "searchLocalinTests":
      return searchLocalinTests;

    case "createTest":
      return createTest;

    case "replaceTo":
      return replaceTo;

    case "getBasename":
      return getBasename;

    case "Articles":
      return Articles;

    case "__programroot":
      return __programroot;

    case "debug":
      return debug;
  }

  return undefined;
}

function _assign__(variableName, value) {
  let rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return rewireData[variableName] = value;
  }
}

function _set_original__(variableName, _value) {
  switch (variableName) {
    case "JESTTER":
      return JESTTER = _value;
  }

  return undefined;
}

function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);

  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

  _assign__(variableName, newValue);

  return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
  let rewireData = _getRewiredData__();

  if (typeof variableName === 'object') {
    Object.keys(variableName).forEach(function (name) {
      rewireData[name] = variableName[name];
    });
    return function () {
      Object.keys(variableName).forEach(function (name) {
        _reset__(variableName);
      });
    };
  } else {
    if (value === undefined) {
      rewireData[variableName] = INTENTIONAL_UNDEFINED;
    } else {
      rewireData[variableName] = value;
    }

    return function () {
      _reset__(variableName);
    };
  }
}

function _reset__(variableName) {
  let rewireData = _getRewiredData__();

  delete rewireData[variableName];

  if (Object.keys(rewireData).length == 0) {
    delete _getRewireRegistry__()[_getRewireModuleId__];
  }

  ;
}

function _with__(object) {
  let rewireData = _getRewiredData__();

  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      rewireData[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = rewireData[variableName];
      rewireData[variableName] = object[variableName];
    });
    let result = callback();

    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }

    return result;
  };
}

let _typeOfOriginalExport = typeof writer;

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(writer, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(writer)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}