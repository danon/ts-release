import fs from "node:fs";
import {dirname, join} from "node:path";
import {ModuleKind, transpile} from "typescript";

import {find} from "./find.ts";
import {type Operation, packageJson, read} from "./package.ts";

export function typeScript(root: string, main: string): Operation {
  return (output: string): void => {
    find(root).forEach(file => {
      writeFile(
        join(output, 'dist', 'cjs', js(file)),
        transpile(read(join(root, file))));
      writeFile(
        join(output, 'dist', 'esm', js(file)),
        transpile(read(join(root, file)), {module: ModuleKind.ES2015}));
    });
    packageJson({
      main: "./dist/cjs/" + js(main),
      module: "./dist/esm/" + js(main),
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
