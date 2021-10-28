#!/usr/bin/env node

const commander = require('commander');
const MergeThemeJson = require('./index');

let baseFile = '';
let targetDir = [];
let output = 'theme.json';

// -b, --base [value]
const setBase = (value) => {
  baseFile = value;
}

// -t, --target [array]
const setTargetDir = (value) => {
  targetDir.push(value);
}

// -o, --output [value]
const setOutput = (value) => {
  output = value;
}

commander
  .version('0.0.1')
  .requiredOption('-b, --base [value]', 'Specify the base json file.', setBase)
  .requiredOption('-t, --target [value...]', 'Specify the target directory', setTargetDir)
  .option('-o, --output [value]', 'Specify the output json file.', setOutput)
  .parse(process.argv);

const mergeThemeJson = new MergeThemeJson(baseFile, targetDir, output);
mergeThemeJson.run();

