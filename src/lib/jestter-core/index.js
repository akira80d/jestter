"use strict";

import path from "path";
import { fileURLToPath } from "url";

import writer from "../jestter-writer/index.js";
import generate from "../jestter-generate/index.js";
import args from "../jestter-cli/index.js";

export default function run() {
  const __filename = fileURLToPath(import.meta.url);
  const __programroot = path.dirname(path.normalize(__filename + "/../../"));

  const argv = args(__programroot);
  const filepath = argv._[0];

  const jsList = [".js",".mjs",".cjs",".ts",".mts",".cts"];
  if(!jsList.includes(path.extname(filepath))){
    throw new Error(`select JavaScript file (${jsList.join(",")})`);
  }

  const testdata = generate(filepath, argv);
  writer(testdata, __programroot, argv);
}

run();
