const merge = require('lodash.merge');
const fs = require('fs');
const path = require('path');

module.exports = class MergeThemeJson {
  
  constructor(baseFile, targetDirArray, output) {
    this.baseFile = baseFile;
    this.targetDirArray = targetDirArray;
    this.output = output;
    this.jsonFiles = [];
    this.directories = [];
    this.resultObj = {};
  }
  
  // get file and directory names
  getJsonFiles(dir) {
    if (fs.existsSync(dir)) {
      const filenames = fs.readdirSync(dir);
      
      for (let i = 0; i < filenames.length; i++) {
        const filename = filenames[i];
        const fullPath = path.join(dir, filename);
        const isJsonFile = filename && fs.statSync(fullPath).isFile() && filename.match(/^_.*\.(json)$/);
        
        // case of file
        if(isJsonFile){
          this.jsonFiles.push(fullPath);

        // case of directory
        }else if(fs.statSync(fullPath).isDirectory()) {
          this.directories.push(fullPath);
        }
      }
    } else {
      console.error('This directory is not found. %j', dir);
    }
  }

  // delete propaties prefixed with a "//".
  deleteComment(sourceObj) {
    for (const key in sourceObj) {
      if (key.match(/^\/\//)) {
        delete sourceObj[key];
      }
      const sourceValue = sourceObj[key];
      if (typeof sourceValue === "object") {
        this.deleteComment(sourceValue);
      }
    }
  }

  // delete {} and []
  deleteEmptyPropaty(obj) {
    for (const key in obj) {
      const strValue = JSON.stringify(obj[key]);
      if (strValue === '{}' || strValue === '[]') {
        delete obj[key];
      }
      if (typeof obj[key] === "object") {
        this.deleteEmptyPropaty(obj[key]);
      }
    }
  }

  // delete null object
  deleteArrayNull(obj) {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].filter(v => v);
      }
      if (typeof obj[key] === "object") {
        this.deleteArrayNull(obj[key]);
      }
    }
  }

  // merge json objects
  mergeJson(jsonFiles) {
    if (fs.existsSync(this.baseFile)) {
      const baseObj = JSON.parse(fs.readFileSync(this.baseFile, 'utf8'));
      for (let i = 0; i < jsonFiles.length; i++) {
        const jsonFile = jsonFiles[i];
        const sourceObj = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        this.deleteComment(sourceObj);
        this.resultObj = merge(baseObj, sourceObj);
      }
    } else {
      console.error('This file is not found. %j', this.baseFile);
    }
  }

  // export json
  exportJson(resultObj) {
    const result = JSON.stringify(resultObj, null, 2);
    if(!this.output.match(/.*\.(json)$/)) {
      this.output = this.output + '.json';
    }
    fs.writeFileSync(this.output, result);
  }

  // use all functions to generate merged json
  run() {
    let isTargetDir;
    for (let i = 0; i < this.targetDirArray.length; i++) {
      const targetDir = this.targetDirArray[i];
      this.getJsonFiles(targetDir);
      if (fs.existsSync(targetDir)) {
        isTargetDir = true;
      }
    }
    if (this.directories.length) {
      for (let i = 0; i < this.directories.length; i++) {
        const childDir = this.directories[i];
        this.getJsonFiles(childDir);
      }
    }
    if (isTargetDir === true) {
      this.mergeJson(this.jsonFiles);
      // delete {} and []
      this.deleteEmptyPropaty(this.resultObj);
      // delete generated null by the aforementioned function
      this.deleteArrayNull(this.resultObj);
      // delete generated {} and [] by the aforementioned function
      this.deleteEmptyPropaty(this.resultObj);
      this.exportJson(this.resultObj);
    }
  }

}