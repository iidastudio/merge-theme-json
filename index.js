import { merge } from 'lodash-es';
import fs from 'fs';
import path from 'path';
const targetDir = './json';
const baseObj = JSON.parse(fs.readFileSync('./json/base.json', 'utf8'));;
let resultObj = {};
let directories = [];

// check functions
const isJsonFile = (item, itemPath) => item && fs.statSync(itemPath).isFile() && item.match(/^_.*\.(json)$/);

// merge json objects
const mergeJson = (targetObj) => {
  resultObj = merge(baseObj, targetObj);
}

// get file and directory names
const getJsonFiles = (dir) => {
  const filenames = fs.readdirSync(dir);

  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];
    const fullPath = path.join(dir, filename);

    // case of file
    if(isJsonFile(filename, fullPath)){
      const loadedObj = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      mergeJson(loadedObj);

    // case of directory
    }else if(fs.statSync(fullPath).isDirectory()) {
      directories.push(fullPath);
    }
  }
}

getJsonFiles(targetDir);
// get child in dir
if (directories.length) {
  for (let i = 0; i <  directories.length; i++) {
    const dirname = directories[i];
    getJsonFiles(dirname);
  }
}

const result = JSON.stringify(resultObj, null, 2);
fs.writeFileSync('theme.json', result);
