"use strict";

import * as path from "path";
import { fileURLToPath } from "url";

import * as writer from "../jestter-writer/index.js";
import * as generate from "../jestter-generate/index.js";
import args from "../jestter-cli/index.js";

export default function run() {
  const __filename = fileURLToPath(import.meta.url);
  const __programroot = path.dirname(path.normalize(__filename + "/../../"));

  const argv = args(__programroot);
  const filepath: string | number = argv._[0];

  if (typeof filepath === "number"){
    throw new Error('The mistake is found in argument.')
  }

  const jsList = [".js",".mjs",".cjs",".ts",".mts",".cts"];
  if(!jsList.includes(path.extname(filepath))){
    throw new Error(`select JavaScript file (${jsList.join(",")})`);
  }

  const testdata = generate.default(filepath, argv);
  writer.default(testdata, __programroot, argv);
}

run();