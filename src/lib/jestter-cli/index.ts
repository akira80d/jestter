#!/usr/bin/env node

import * as fs from "fs";
import path from "path";
import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const yargs = _yargs(hideBin(process.argv));

export default function args(__programroot: string){
  const packagejson = path.join(__programroot, "./package.json");
  const jsonObject = JSON.parse(fs.readFileSync(packagejson, 'utf8'));
  const version = jsonObject.version;

  const argv = yargs
    .version(version) 
      .alias('version', 'v')
      .describe('version', 'Show version information')
    .command('<file path>', '$ npx jestter javascriptfile [option]')
    .demandCommand(1)
    .option("verbose",{
      alias: "V",
      description: "Display verbose log" 
    })
    .help()
      .alias('help', 'h')
    .argv

  return argv;
}

