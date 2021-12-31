"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = void 0;
exports.__set__ = exports.__Rewire__ = _set__;
exports.__GetDependency__ = exports.__get__ = _get__;
exports.default = generate;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _parser = require("@babel/parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = process.argv[2] == "-d" ? true : false;
/*
 * cellect exportdefualt and functions for generate test
 */

let COLLECTIONS = {
  exportdefault: undefined,
  functions: []
};
const TYPES = {
  ImportDeclaration: "ImportDeclaration",
  VariableDeclaration: "VariableDeclaration",
  VariableDeclarator: "VariableDeclarator",
  ExportDefaultDeclaration: "ExportDefaultDeclaration",
  ExportNamedDeclaration: "ExportNamedDeclaration",
  FunctionDeclaration: "FunctionDeclaration",
  FunctionExpression: "FunctionExpression",
  ArrowFunctionExpression: "ArrowFunctionExpression",
  ExpressionStatement: "ExpressionStatement",
  Identifier: "Identifier"
};

function generate(filepath) {
  _get__("debuglog")(">jestter-generate:generate");

  const code = _get__("fs").readFileSync(filepath, "utf-8");

  const ast = _get__("parse")(code, {
    sourceType: "module",
    plugins: ["es2015", "jsx", "react"]
  });

  let ancestors = "ROOT";

  _get__("nodesProcess")(ast.program.body, ancestors);

  let testdata = _get__("makeTestData")(filepath);

  _get__("debuglog")("------");

  _get__("debuglog")("testdata");

  _get__("debuglog")(testdata);

  return testdata;
}

function nodesProcess(nodes, ancestors) {
  for (let i = 0; i < nodes.length; i++) {
    _get__("switchTypes")(nodes[i], ancestors);
  }
}

function switchTypes(node, ancestors) {
  switch (node.type) {
    case _get__("TYPES").ExportDefaultDeclaration:
      _get__("debuglog")(["types:ExportDefaultDeclaration", node.type]);

      ancestors += "," + node.type;

      _get__("debuglog")(node);

      _get__("COLLECTIONS").exportdefault = _get__("returnExportDefaultInCOLLECTIONS")(node);

      _get__("switchTypes")(node.declaration, ancestors);

      break;

    case _get__("TYPES").ExportNamedDeclaration:
      _get__("debuglog")(["types:ExportNamedDeclaration", node.type]);

      ancestors += "," + node.type;

      _get__("switchTypes")(node.declaration, ancestors);

      break;

    case _get__("TYPES").ImportDeclaration:
      _get__("debuglog")(["types:ImportDeclaration", node.type]);

      break;

    case _get__("TYPES").VariableDeclaration:
      _get__("debuglog")(["types:VariableDeclaration", node.type]);

      ancestors += "," + node.type;

      _get__("nodesProcess")(node.declarations, ancestors);

      break;

    case _get__("TYPES").VariableDeclarator:
      ancestors += "," + node.type;

      _get__("debuglog")(["types:VariableDeclarator", node.type]); //debuglog(["id.type",node.id.type]);
      //debuglog(["id.id.loc.identifierName",node.id.loc.identifierName]);


      let name = node.id.loc.identifierName; //debuglog(["init.type",node.init.type]);

      if (node.init.type == "ArrowFunctionExpression") {
        let test = _get__("makeArrowFunctionTestData")(node.init, name, ancestors);

        _get__("COLLECTIONS").functions.push(test);
      }

      if (node.init.type == "FunctionExpression") {
        let test = _get__("makeFunctionExpressionTestData")(node.init, name, ancestors);

        _get__("COLLECTIONS").functions.push(test);
      }

      break;

    case _get__("TYPES").FunctionDeclaration:
      ancestors += "," + node.type;

      _get__("debuglog")(["types:FunctionDeclaration", node.type]);

      let test = _get__("makeFunctionTestData")(node, ancestors);

      _get__("COLLECTIONS").functions.push(test);

      break;

    case _get__("TYPES").ExpressionStatement:
      _get__("debuglog")(["types:ExpressionStatement", node.type]);

      break;

    default:
      _get__("debuglog")(["types:default", node.type]);

      break;
  }
}

function returnExportDefaultInCOLLECTIONS(node) {
  if (node.declaration.type == _get__("TYPES").Identifier) {
    return [_get__("TYPES").ExportDefaultDeclaration, node.declaration.name];
  } else if (node.declaration.type == _get__("TYPES").FunctionDeclaration) {
    return [_get__("TYPES").ExportDefaultDeclaration, node.declaration.id.name];
  }

  return undefined;
}

function makeArrowFunctionTestData(node, name, ancestors) {
  //debuglog(["makeArrowFunction",node, name, ancestors]);
  return {
    ancestors: ancestors,
    title: name + " Test ....",
    name: name,
    kind: "ArrowFunction",
    params: node.params.map(p => p.name)
  };
}

function makeFunctionExpressionTestData(node, name, ancestors) {
  //debuglog(["makeFunctionExp",node, name, ancestors]);
  return {
    ancestors: ancestors,
    title: name + " Test ....",
    name: name,
    kind: "FunctionExpression",
    params: node.params.map(p => p.name)
  };
}

function makeFunctionTestData(node, ancestors) {
  //debuglog(["makeFunctionTestData", node, ancestors]);
  return {
    ancestors: ancestors,
    title: node.id.name + " Test ....",
    name: node.id.name,
    kind: "Function",
    params: node.params.map(p => p.name)
  };
}

function makeTestData(filepath) {
  const defaultname = _get__("COLLECTIONS").exportdefault ? _get__("COLLECTIONS").exportdefault[1] : undefined;
  let testdata = {
    filepath: filepath,
    importset: {
      defaultname: defaultname,
      names: [],
      filepath: "./" + _get__("path").basename(filepath)
    },
    tests: []
  }; //console.log(COLLECTIONS);

  for (let i = 0; i < _get__("COLLECTIONS").functions.length; i++) {
    let func = _get__("COLLECTIONS").functions[i];

    let range = "local";

    if (_get__("COLLECTIONS").exportdefault != undefined && func.name == _get__("COLLECTIONS").exportdefault[1]) {
      range = "exportdefault";
    } else if (func.ancestors.match(/ExportNamedDeclaration/)) {
      range = "export";
      testdata.importset.names.push(func.name);
    }

    testdata.tests.push({
      title: func.title,
      name: func.name,
      kind: func.kind,
      params: func.params,
      range: range
    });
  }

  return testdata;
}

const debuglog = msg => {
  if (_get__("debug")) {
    console.log(msg);
  }
}; //const filepath = process.argv[process.argv.length - 1];
//generate(filepath);


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
    case "debuglog":
      return debuglog;

    case "fs":
      return _fs.default;

    case "parse":
      return _parser.parse;

    case "nodesProcess":
      return nodesProcess;

    case "makeTestData":
      return makeTestData;

    case "switchTypes":
      return switchTypes;

    case "TYPES":
      return TYPES;

    case "COLLECTIONS":
      return COLLECTIONS;

    case "returnExportDefaultInCOLLECTIONS":
      return returnExportDefaultInCOLLECTIONS;

    case "makeArrowFunctionTestData":
      return makeArrowFunctionTestData;

    case "makeFunctionExpressionTestData":
      return makeFunctionExpressionTestData;

    case "makeFunctionTestData":
      return makeFunctionTestData;

    case "path":
      return _path.default;

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
  switch (variableName) {}

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

let _typeOfOriginalExport = typeof generate;

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(generate, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(generate)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}