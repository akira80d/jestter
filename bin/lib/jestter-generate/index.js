"use strict";

import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";

const debug = process.argv[2] == "-d" ? true : false;

/*
 * cellect exportdefualt and functions for generate test
 */
let COLLECTIONS = {
  exportdefault: undefined,
  functions: [],
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
  Identifier: "Identifier",
};

export default function generate(filepath) {
  debuglog(">jestter-generate:generate");
  const code = fs.readFileSync(filepath, "utf-8");
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["es2015", "jsx", "react"],
  });

  let ancestors = "ROOT";
  nodesProcess(ast.program.body, ancestors);

  let testdata = makeTestData(filepath);
  debuglog("testdata----");
  debuglog(testdata);
  return testdata;
}

function nodesProcess(nodes, ancestors) {
  for (let i = 0; i < nodes.length; i++) {
    switchTypes(nodes[i], ancestors);
  }
}

function switchTypes(node, ancestors) {
  switch (node.type) {
    case TYPES.ExportDefaultDeclaration:
      debuglog(["types:ExportDefaultDeclaration", node.type]);
      ancestors += "," + node.type;
      debuglog(node);
      COLLECTIONS.exportdefault = returnExportDefaultInCOLLECTIONS(node);
      switchTypes(node.declaration, ancestors);
      break;
    case TYPES.ExportNamedDeclaration:
      debuglog(["types:ExportNamedDeclaration", node.type]);
      ancestors += "," + node.type;
      switchTypes(node.declaration, ancestors);
      break;
    case TYPES.ImportDeclaration:
      debuglog(["types:ImportDeclaration", node.type]);
      break;
    case TYPES.VariableDeclaration:
      debuglog(["types:VariableDeclaration", node.type]);
      ancestors += "," + node.type;
      nodesProcess(node.declarations, ancestors);
      break;
    case TYPES.VariableDeclarator:
      ancestors += "," + node.type;
      debuglog(["types:VariableDeclarator", node.type]);
      //debuglog(["id.type",node.id.type]);
      //debuglog(["id.id.loc.identifierName",node.id.loc.identifierName]);
      let name = node.id.loc.identifierName;
      //debuglog(["init.type",node.init.type]);
      if (node.init.type == "ArrowFunctionExpression") {
        let test = makeArrowFunctionTestData(node.init, name, ancestors);
        COLLECTIONS.functions.push(test);
      }
      if (node.init.type == "FunctionExpression") {
        let test = makeFunctionExpressionTestData(node.init, name, ancestors);
        COLLECTIONS.functions.push(test);
      }
      break;
    case TYPES.FunctionDeclaration:
      ancestors += "," + node.type;
      debuglog(["types:FunctionDeclaration", node.type]);
      let test = makeFunctionTestData(node, ancestors);
      COLLECTIONS.functions.push(test);
      break;
    case TYPES.ExpressionStatement:
      debuglog(["types:ExpressionStatement", node.type]);
      break;
    default:
      debuglog(["types:default", node.type]);
      break;
  }
}

function returnExportDefaultInCOLLECTIONS(node) {
  if (node.declaration.type == TYPES.Identifier) {
    return [TYPES.ExportDefaultDeclaration, node.declaration.name];
  } else if (node.declaration.type == TYPES.FunctionDeclaration) {
    return [TYPES.ExportDefaultDeclaration, node.declaration.id.name];
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
    params: node.params.map((p) => p.name),
  };
}

function makeFunctionExpressionTestData(node, name, ancestors) {
  //debuglog(["makeFunctionExp",node, name, ancestors]);
  return {
    ancestors: ancestors,
    title: name + " Test ....",
    name: name,
    kind: "FunctionExpression",
    params: node.params.map((p) => p.name),
  };
}

function makeFunctionTestData(node, ancestors) {
  //debuglog(["makeFunctionTestData", node, ancestors]);
  return {
    ancestors: ancestors,
    title: node.id.name + " Test ....",
    name: node.id.name,
    kind: "Function",
    params: node.params.map((p) => p.name),
  };
}

function makeTestData(filepath) {
  const defaultname = COLLECTIONS.exportdefault
    ? COLLECTIONS.exportdefault[1]
    : undefined;
  let testdata = {
    filepath: filepath,
    importset: {
      defaultname: defaultname,
      names: [],
      filepath: "./" + path.basename(filepath),
    },
    tests: [],
  };

  //console.log(COLLECTIONS);
  for (let i = 0; i < COLLECTIONS.functions.length; i++) {
    let func = COLLECTIONS.functions[i];
    let range = "local";
    if (
      COLLECTIONS.exportdefault != undefined &&
      func.name == COLLECTIONS.exportdefault[1]
    ) {
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
      range: range,
    });
  }
  return testdata;
}

const debuglog = (msg) => {
  if (debug) {
    console.log(msg);
  }
};

//const filepath = process.argv[process.argv.length - 1];
//generate(filepath);
