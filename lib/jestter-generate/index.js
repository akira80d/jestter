"use strict";

import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
const debug = process.argv[2] == "-d" ? true : false;
const TYPES = {
  ImportDeclaration: "ImportDeclaration",
  VariableDeclaration: "VariableDeclaration",
  ExportDefaultDeclaration: "ExportDefaultDeclaration",
  ExportNamedDeclaration: "ExportNamedDeclaration",
  FunctionDeclaration: "FunctionDeclaration",
  ExpressionStatement: "ExpressionStatement",
  Identifier: "Identifier"
};
export default function generate(filepath) {
  debuglog(">jestter-generate:generate");
  const code = fs.readFileSync(filepath, "utf-8");
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["es2015", "jsx", "react"]
  });
  let nodeTypes = {
    ImportDeclaration: [],
    VariableDeclaration: [],
    ExportDefaultDeclaration: [],
    ExportNamedDeclaration: [],
    FunctionDeclaration: [],
    ExpressionStatement: [],
    default: []
  };
  const bodylength = ast.program.body.length;
  ast.program.body.forEach(node => {
    switch (node.type) {
      case TYPES.ImportDeclaration:
        nodeTypes.ImportDeclaration.push(importDeclarationProcess(node));
        break;

      case TYPES.VariableDeclaration:
        nodeTypes.VariableDeclaration.push(variableDeclarationProcess(node));
        break;

      case TYPES.ExportDefaultDeclaration:
        nodeTypes.ExportDefaultDeclaration.push(exportDefaultDeclarationProcess(node));
        break;

      case TYPES.ExportNamedDeclaration:
        nodeTypes.ExportNamedDeclaration.push(exportNamedDeclarationProcess(node));
        break;

      case TYPES.FunctionDeclaration:
        nodeTypes.FunctionDeclaration.push(functionDeclarationProcess(node));
        break;

      case TYPES.ExpressionStatement:
        nodeTypes.ExpressionStatement.push(expressionStatementProcess(node));
        break;

      default:
        nodeTypes.default.push(node.type);
        break;
    }
  });
  let testdata = makeTestData(nodeTypes, filepath);
  debuglog("------");
  debuglog("testdata");
  debuglog(testdata);
  return testdata;
}

function makeTestData(nodeTypes, filepath) {
  let testdata = {
    filepath: filepath,
    importset: {
      defaultname: undefined,
      names: [],
      filepath: "./" + path.basename(filepath)
    },
    tests: []
  };
  const funcs = nodeTypes.FunctionDeclaration;
  /*
   * export defualt function process
   */

  if (nodeTypes.ExportDefaultDeclaration) {
    const test = makeExportDefaultTestData(nodeTypes.ExportDefaultDeclaration);
    if (!containFunctionName(funcs, test.name)) testdata.tests.push(test);
    if (test.name) testdata.importset.defaultname = test.name;
  } //makeNamedTestData(nodeTypes.ExportNamedDeclaration);

  /*
   * function process
   */


  const tests = makeFunctionTestDatas(funcs);

  for (let i = 0; i < tests.length; i++) {
    if (tests[i].name == testdata.importset.defaultname) {
      debuglog([tests[i].name, testdata.importset.defaultname]);
      testdata.tests = testdata.tests.concat(tests[i]);
    }
  }

  return testdata;
}
/*
 * text.name of ExportDefaultTestData contain
 * FunctionDeclaration
 */


function containFunctionName(funcs, name) {
  for (let i = 0; i < funcs.length; i++) {
    if (funcs[i].id_name == name) return true;
  }

  return false;
}

function makeExportDefaultTestData(nodes) {
  let test;

  switch (nodes[0].declaration_type) {
    case TYPES.FunctionDeclaration:
      debuglog("makeDefaultTestData:FunctionDeclaration");
      debuglog(["nodes[0];", nodes[0]]);
      test = makeFunctionDeclarationTestData(nodes[0]);
      debuglog(["test:", test]);
      return test;
      break;

    case TYPES.VariableDeclaration:
      debuglog("makeDefaultTestData:VariableDeclaration");
      break;

    case TYPES.Identifier:
      debuglog("makeDefaultTestData:Identifier");
      test = makeIdentiferTestData(nodes[0]);
      debuglog(["nodes[0]:", nodes[0]]);
      debuglog(["test:", test]);
      return test;
      break;

    default:
      throw new Error("makeDefaultTestData:default");
      debuglog("makeDefaultTestData:default!!!!:", nodes[0].declaration_type);
      debuglog(nodes[0]);
      break;
  }
}

function makeNamedTestData(nodes) {
  const funcs = [];

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    debuglog(node.declaration_type);
    debuglog(node);
  }

  ;
}

function makeFunctionDeclarationTestData(node) {
  return {
    title: node.declaration_id_name + " Test ....",
    name: node.declaration_id_name,
    kind: "Function",
    params: node.declaration_params.map(p => p.name)
  };
}

function makeFunctionTestDatas(nodes) {
  let tests = [];
  nodes.forEach(node => {
    debuglog("-----");
    const test = makeFunctionTestData(node);
    tests.push(test);
  });
  return tests;
}

function makeFunctionTestData(node) {
  return {
    title: node.id_name + " Test ....",
    name: node.id_name,
    kind: "Function",
    params: node.params.map(p => p.name)
  };
}

function makeIdentiferTestData(node) {
  let test = {
    title: node.declaration_name + " Test ....",
    name: node.declaration_name
  };
  /*
   * TODO
   * search FUNCTION / ???
   */

  return test;
}

function importDeclarationProcess(node) {
  const object = {
    type: node.type,
    source_type: node.source.type,
    source_value: node.source.value
  };
  return object;
}

function functionDeclarationProcess(node) {
  const object = {
    type: node.type,
    id_name: node.id.name,
    params: node.params,
    body_type: node.body.type,
    body_body: node.body.body
  };
  return object;
}

function arrowFunctionExpressionProcess(node) {
  const object = {
    type: node.type,
    name: node.name,
    kind: undefined,
    params: node.params.map(m => m.name)
  };
  return object;
}

function variableDeclarationProcess(node) {
  const object = {
    type: node.type,
    declarations: node.declarations,
    kind: node.kind
  };
  return object;
}

function variableDeclaraterProcess(node) {
  const object = {
    type: node.type
  };
  return object;
}

function stringLiteralProcess(node) {
  const object = {
    type: node.type
  };
  return object;
}

function exportDefaultDeclarationProcess(node) {
  let object; //FunctionDeclaration/Identifier(App.js)

  if (node.declaration.type == TYPES.FunctionDeclaration) {
    //FunctionDeclaration
    object = {
      type: node.type,
      declaration_type: node.declaration.type,
      declaration_id_name: node.declaration.id.name,
      declaration_params: node.declaration.params,
      declaration_body: node.declaration.body
    };
  } else if (node.declaration.type == TYPES.Identifier) {
    //Identifier
    object = {
      type: node.type,
      declaration_type: node.declaration.type,
      declaration_name: node.declaration.name
    };
  } else {
    //TODO class
    throw new Error("exportDefaultDeclaration:error", node);
  }

  return object;
}

function exportNamedDeclarationProcess(node) {
  const object = {
    type: node.type,
    declaration_type: node.declaration.type,
    declaration_declarations: node.declaration.declarations,
    //type:Identifier, name: 'name'
    //type:ArrowFunctionExpression, params:[Array], body[Node]
    //type:StringLiteral, value: 'tarou'
    declaration_kind: node.declaration.kind
  };
  return object;
}

function blockStatementProcess(node) {
  const object = {
    type: node.type
  };
  return object;
}

function binaryExpressionProcess(node) {
  const object = {
    type: node.type
  };
  return object;
}

function expressionStatementProcess(node) {
  const object = {
    type: node.type,
    expression_type: node.expression.type,
    expression_callee: node.expression.callee
  };
  return object;
}

const debuglog = msg => {
  if (debug) {
    console.log(msg);
  }
}; //const filepath = process.argv[process.argv.length - 1];
//generate(filepath);