#!/usr/bin/env node
const fs = require('fs-extra');
function copyFromDefault(p) {
  if (!fs.existsSync(p)) {
    const defaultFile = `${p}.default`;
    if (fs.existsSync(defaultFile)) {
      fs.copyFileSync(`${p}.default`, p);
    }
  }
}

[/*'.vscode/settings.json', */ '.env'].map(copyFromDefault);

// from https://stackoverflow.com/questions/26827920/nodejs-recursively-list-files-in-directory/26828357#26828357
function walk(directoryName, fnc) {
  fs.readdir(directoryName, function (e, files) {
    if (e) {
      return;
    }
    files.forEach(function (file) {
      var fullPath = directoryName + '/' + file;
      fs.stat(fullPath, function (e, f) {
        if (e) {
          return;
        }
        if (f.isDirectory()) {
          walk(fullPath, fnc);
        } else {
          fnc(fullPath);
        }
      });
    });
  });
}

const overridesFolder = 'overrides';
walk(overridesFolder, (fullpath) =>
  fs.copyFileSync(fullpath, `node_modules/${fullpath.substring(overridesFolder.length + 1)}`)
);
