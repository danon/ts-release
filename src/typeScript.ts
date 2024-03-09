import fs from "node:fs";
import {dirname, join} from "node:path";
import {type CompilerOptions, ModuleKind, transpileModule, type TranspileOutput} from "typescript";

import {find} from "./find.ts";
import {type Operation, packageJson, read} from "./package.ts";
import {updateImport} from "./updateImport.ts";

export function typeScript(root: string, main: string): Operation {
  return (output: string): void => {
    find(root).forEach(file => {
      writeFile(
        join(output, 'dist', 'cjs', js(file)),
        transpile(read(join(root, file)), {}));
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

function transpile(sourceCode: string, compilerOptions: CompilerOptions): string {
  const output: TranspileOutput = transpileModule(sourceCode, {
    compilerOptions,
    transformers: {after: [updateImport]},
  });
  return output.outputText;
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
