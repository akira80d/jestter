"use strict";
import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
/*
 * collect exportdefualt and functions for generate test
 */
export default function generate(filepath, argv) {
    let collections = {
        exportdefault: undefined,
        functions: [],
        classes: [],
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
        CallExpression: "CallExpression",
        ExpressionStatement: "ExpressionStatement",
        Identifier: "Identifier",
        RestElement: "RestElement",
        AssignmentPattern: "AssignmentPattern",
        ClassDeclaration: "ClassDeclaration",
    };
    const run = function () {
        vlog(">jestter-generate:generate", argv);
        const code = fs.readFileSync(filepath, "utf-8");
        const ast = parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
        });
        let ancestors = "ROOT";
        nodesProcess(ast.program.body, ancestors, argv);
        let testdata = makeTestData(filepath);
        vlog(["testdata:", testdata, testdata.tests], argv);
        return testdata;
    };
    function nodesProcess(nodes, ancestors, argv) {
        for (let i = 0; i < nodes.length; i++) {
            switchTypes(nodes[i], ancestors, argv);
        }
    }
    function switchTypes(node, ancestors, argv) {
        vlog(node.type, argv);
        switch (node.type) {
            case TYPES.ExportDefaultDeclaration:
                ancestors += "," + node.type;
                collections.exportdefault = returnExportDefaultInCOLLECTIONS(node);
                switchTypes(node.declaration, ancestors, argv);
                break;
            case TYPES.ExportNamedDeclaration:
                ancestors += "," + node.type;
                switchTypes(node.declaration, ancestors, argv);
                break;
            case TYPES.ImportDeclaration:
                break;
            case TYPES.VariableDeclaration:
                ancestors += "," + node.type;
                nodesProcess(node.declarations, ancestors, argv);
                break;
            case TYPES.VariableDeclarator:
                ancestors += "," + node.type;
                const name = node.id.loc.identifierName;
                if (node.init.type == "ArrowFunctionExpression") {
                    let test = makeFunctionTestData(node.init, name, ancestors, node.init.type);
                    collections.functions = collections.functions.concat(test);
                }
                else if (node.init.type == "FunctionExpression") {
                    let test = makeFunctionTestData(node.init, name, ancestors, node.init.type);
                    collections.functions = collections.functions.concat(test);
                }
                else if (node.init.type == "CallExpression") {
                    vlog(["CallExpression:", node.init], argv);
                    let test = callExpressionProcess(node.init, name, ancestors, argv);
                    vlog(test, argv);
                    collections.functions = collections.functions.concat(test);
                }
                else {
                    vlog(["VariableDeclarator->:", node.init.type, node.init], argv);
                }
                break;
            case TYPES.FunctionDeclaration:
                ancestors += "," + node.type;
                const nameid = node.id.name;
                let test = makeFunctionTestData(node, nameid, ancestors, node.type);
                collections.functions = collections.functions.concat(test);
                break;
            case TYPES.ClassDeclaration:
                ancestors += "," + node.type;
                const classname = node.id.name;
                const classMethods = returnClassMethods(node.body.body, argv);
                const classTest = makeClassTestData(classname, ancestors, node.type, classMethods);
                collections.classes = collections.classes.concat(classTest);
                break;
            case TYPES.ExpressionStatement:
                break;
            default:
                vlog(["types:default", node.type], argv);
                break;
        }
    }
    /*
     * return class methods and args
     */
    function returnClassMethods(nodes, argv) {
        let classMethods = { constructor: {}, methods: [] };
        //vlog(["ClassDeclaration->body->body:", nodes], argv);
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (node.type === "ClassMethod") {
                vlog(["ClassMethod:", node], argv);
                const paramsList = returnParamsNameList(node.params);
                if (node.kind === "constructor") {
                    classMethods.constructor = { kind: node.kind, name: node.key.name, params: paramsList, async: node.async };
                }
                else if (node.kind === "method") {
                    classMethods.methods = classMethods.methods.concat({ kind: node.kind, static: node.static, name: node.key.name, params: paramsList, async: node.async });
                }
            }
        }
        //vlog(["classMethods =>", classMethods, classMethods.methods], argv);
        return classMethods;
    }
    /*
     * suppor)t
     * callExpression -> FunctionExpression
     */
    function callExpressionProcess(node, name, ancestors, argv) {
        const paramslist = returnParamsNameList(node.callee.params);
        const kind = node.type + "->" + node.callee.type;
        return makeFunctionTestData(node.callee, name, ancestors, kind);
    }
    function returnExportDefaultInCOLLECTIONS(node) {
        if (node.declaration.type == TYPES.Identifier) {
            return [TYPES.ExportDefaultDeclaration, node.declaration.name];
        }
        else if (node.declaration.type == TYPES.FunctionDeclaration) {
            return [TYPES.ExportDefaultDeclaration, node.declaration.id.name];
        }
        else if (node.declaration.type == TYPES.ClassDeclaration) {
            return [TYPES.ExportDefaultDeclaration, node.declaration.id.name];
        }
        return undefined;
    }
    function makeFunctionTestData(node, name, ancestors, kind) {
        let test = {
            ancestors: ancestors,
            title: name + " Test ....",
            name,
            kind,
            params: returnParamsNameList(node.params),
            range: "",
            body: [],
        };
        return test;
    }
    function makeClassTestData(name, ancestors, kind, classMethods) {
        let params = classMethods.constructor.params;
        let test = {
            ancestors,
            title: name + " Test ....",
            name,
            kind,
            params: params ? params : [""],
            range: "",
            body: classMethods.methods,
        };
        return test;
    }
    /*
     * return array of argment name
     * example)
     * function(arg1,arg2) => [arg1, arg2]
     * support)
     * (...arg, arg = "default")
     */
    function returnParamsNameList(params) {
        const paramslist = params.map((p) => {
            if (p.type == TYPES.Identifier) {
                return p.name;
            }
            else if (p.type == TYPES.RestElement) {
                //...arg
                return p.argument.name;
            }
            else if (p.type == TYPES.AssignmentPattern) {
                //arg = "defaultargment"
                return p.left.name;
            }
            else {
                console.log(p);
                return "object";
            }
        });
        return paramslist;
    }
    function makeTestData(filepath) {
        const defaultname = collections.exportdefault
            ? collections.exportdefault[1]
            : "";
        let testdata = {
            filepath: filepath,
            importset: {
                defaultname: defaultname,
                names: [],
                filepath: "./" + path.basename(filepath),
            },
            tests: [],
        };
        /*
         * collect export default function name & export funcation name
         * collect export default class name & export class name
         */
        testdata = makeTests(testdata, "functions");
        testdata = makeTests(testdata, "classes");
        // wrning no exportdefualt & export
        if (testdata.importset.defaultname == "" &&
            testdata.importset.names.length == 0) {
            console.error("Can not TEST only local function");
        }
        return testdata;
    }
    function makeTests(testdata, type) {
        let objs = undefined;
        if (type == "functions") {
            objs = collections.functions;
        }
        else {
            objs = collections.classes;
        }
        for (let i = 0; i < objs.length; i++) {
            let obj = objs[i];
            let range = "local";
            if (collections.exportdefault != undefined &&
                obj.name == collections.exportdefault[1]) {
                range = "exportdefault";
            }
            else if (obj.ancestors.match(/ExportNamedDeclaration/)) {
                range = "export";
                testdata.importset.names = testdata.importset.names.concat(obj.name);
            }
            let test = {
                ancestors: obj.ancestors,
                title: obj.title,
                name: obj.name,
                kind: obj.kind,
                params: obj.params,
                range: range,
                body: obj.body,
            };
            testdata.tests = testdata.tests.concat(test);
        }
        return testdata;
    }
    const vlog = (msg, argv) => {
        let bool;
        try {
            bool = argv.V;
        }
        catch (_a) {
            return;
        }
        if (bool) {
            console.log(msg);
        }
    };
    return run();
}
