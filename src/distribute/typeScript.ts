import fs from "node:fs";
import {basename, dirname, join} from "node:path";
import {type CompilerOptions, ModuleKind, transpileModule, type TranspileOutput} from "typescript";

import {type Operation, read} from "./package.ts";
import {updateImport} from "./updateImport.ts";

export function typeScript(entryFile: string): Operation {
  return (output: string): void => {
    buildTypeScript(entryFile, output);
  };
}

function buildTypeScript(entryFile: string, output: string): void {
  transpileTypeScript(entryFile, output, 'cjs', {});
  transpileTypeScript(entryFile, output, 'esm', {module: ModuleKind.ES2015});
}

function transpileTypeScript(entryFile: string, output: string, target: string, options: CompilerOptions): void {
  const path: string = join(output, 'dist', target, js(basename(entryFile)));
  writeFile(path, transpile(read(entryFile), options));
}

function js(file: string): string {
  return file.replace('.ts', '.js');
}

function writeFile(path: string, content: string): void {
  createDirectory(dirname(path));
  fs.writeFileSync(path, content);
}

function createDirectory(output: string): void {
  fs.mkdirSync(output, {recursive: true});
}

function transpile(sourceCode: string, options: CompilerOptions): string {
  const output: TranspileOutput = transpileModule(sourceCode, {
    compilerOptions: options,
    transformers: {before: [updateImport]},
  });
  return output.outputText;
}
