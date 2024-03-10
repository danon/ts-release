import {spawnSync} from "node:child_process";

import {distribute, packageJson, typeScript} from "../../src/index.ts";
import {Directory, directory} from "./directory.ts";

export function executeTypeScript(target: 'cjs'|'esm', sourceCode: string): string {
  return directory(function (tmp: Directory): string {
    tmp.write('script.ts', sourceCode);
    distribute(tmp.join('output'), [
      typeScript(tmp.join('script.ts')),
      packageJson({type: target === 'esm' ? 'module' : 'commonjs'}),
    ]);
    return nodeExecute(tmp.join(`output/dist/${target}/script.js`));
  });
}

function nodeExecute(scriptFilename: string): string {
  const result = spawnSync('node', [scriptFilename], {shell: true});
  if (result.status === 0) {
    return result.stdout.toString();
  }
  throw new Error(result.stderr.toString());
}
