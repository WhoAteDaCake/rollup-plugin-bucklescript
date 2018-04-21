const os = require('os');
const { exec } = require('child_process');
const { readFile, readFileSync } = require('fs');

import utils from './utils';

const bsbCommand = 'bsb';
const SYNTAX_MATCH_RE = /(File.*line.*characters.*):/gm;
// try {
//   bsbCommand = require.resolve("bs-platform/bin/bsb.exe");
// } catch (e) {
//   bsbCommand = `bsb`;
// }

const bsb = (() => {
  switch (utils.platform()) {
    case 'darwin':
      return `script -q /dev/null ${bsbCommand} -make-world -color`;
    case 'linux':
      return `script --return -qfc "${bsbCommand} -make-world -color" /dev/null`;
    case 'wsl':
      return `${bsbCommand} -make-world`;
    default:
      return `${bsbCommand} -make-world`;
  }
})();

/** Runs `bsb` async */
function runBuild(cwd /*: string */) /*: Promise<string> */ {
  return new Promise((resolve, reject) => {
    exec(bsb, { maxBuffer: Infinity, cwd }, (err, stdout, stderr) => {
      let output = `${stdout.toString()}\n${stderr.toString()}`;
      if (err) {
        reject(output);
      } else {
        resolve(output);
      }
    });
  });
}

const buildRuns = {};

/** Compiles a Reason file to JS */
export function compileFile(
  buildDir /*: string */,
  moduleType /*: BsModuleFormat | 'js' */,
  path /*: string */,
  id /*: ?string */ = null
) /*: Promise<Compilation> */ {
  if (id && buildRuns[id] !== undefined) {
    buildRuns[id] = runBuild(buildDir);
  }

  const buildProcess = id ? buildRuns[id] : runBuild(buildDir);

  return buildProcess
    .then(
      output =>
        new Promise((resolve, reject) => {
          readFile(path, (err, res) => {
            if (err) {
              resolve({
                src: undefined,
                warnings: [],
                errors: [err],
              });
            } else {
              const src = utils.transformSrc(moduleType, res.toString());

              resolve({
                src,
                warnings: utils.processBsbWarnings(output),
                errors: [],
              });
            }
          });
        })
    )
    .catch(err => ({
      src: undefined,
      warnings: [],
      errors: utils.processBsbError(err),
    }));
}

// module.exports = {
//   BSB: bsb,
//   runBuild,
//   runBuildSync,
//   compileFile,
//   compileFileSync
// };
