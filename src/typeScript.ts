import fs from "node:fs";
import {basename, dirname, join} from "node:path";
import {ModuleKind, transpile} from "typescript";

import {type Operation, packageJson, read} from "./package.ts";

export function typeScript(entryFile: string): Operation {
  return (output: string): void => {
    const filename = basename(entryFile);
    writeFile(
      join(output, 'dist', 'cjs', js(filename)),
      transpile(read(entryFile)));
    writeFile(
      join(output, 'dist', 'esm', js(filename)),
      transpile(read(entryFile), {module: ModuleKind.ES2015}));
    packageJson({
      main: './dist/cjs/' + js(filename),
      module: './dist/esm/' + js(filename),
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
