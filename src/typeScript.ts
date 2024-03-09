import fs from "node:fs";
import {basename, dirname, join} from "node:path";
import {transpile} from "typescript";

import {type Operation, packageJson, read} from "./package.ts";

export function typeScript(entryFile: string): Operation {
  return (output: string): void => {
    writeFile(
      join(output, 'dist', 'cjs', js(basename(entryFile))),
      transpile(read(entryFile)));
    packageJson({
      main: './dist/cjs/' + js(basename(entryFile)),
    })(output);
  };
}

function js(file: string): string {
  return file.replace(/\.ts$/, '.js');
}

function writeFile(path: string, content: string): void {
  createDirectory(dirname(path));
  fs.writeFileSync(path, content);
}

function createDirectory(output: string): void {
  fs.mkdirSync(output, {recursive: true});
}
