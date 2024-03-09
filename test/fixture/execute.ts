import {spawnSync} from "node:child_process";

import {distribute, packageJson} from "../../src/package.ts";
import {typeScript} from "../../src/typeScript.ts";
import {Directory, directory} from "./directory.ts";

export function executeTypeScript(target: 'cjs'|'esm', sourceCode: string): string {
  return directory(function (dir: Directory): string {
    dir.write('input/script.ts', sourceCode);
    distribute(dir.join('output'), [
      typeScript(dir.join('input'), ''),
      packageJson({type: target === 'esm' ? 'module' : 'commonjs'}),
    ]);
    return nodeExecute(dir.join(`output/dist/${target}/script.js`));
  });
}

function nodeExecute(scriptFilename: string): string {
  const result = spawnSync('node', [scriptFilename], {shell: true});
  if (result.status === 0) {
    return result.stdout.toString();
  }
  throw new Error(result.stderr.toString());
}
