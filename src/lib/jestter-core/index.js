#!/usr/bin/env node

'use strict';

import writer from '../jestter-writer/index.js';
import generate from '../jestter-generate/index.js';

export default function run(){
  if (process.argv.length == 2) {
    console.log(" you need to select javaScriptFile in argument");
    console.log(" $ node jestter.js ./test.js");
    return;
  }

  const filepath = process.argv[process.argv.length - 1];

  const testdata = generate(filepath);
  writer(testdata);
}

run();
