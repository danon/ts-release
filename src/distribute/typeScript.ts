import fs from "node:fs";
import {basename, dirname, join} from "node:path";
import {type CompilerOptions, createProgram, ModuleKind, type Program, transpileModule, type TranspileOutput} from "typescript";

import {type Operation, packageJson, read} from "./package.ts";
import {updateImport} from "./updateImport.ts";

export function typeScript(entryFile: string): Operation {
  return (output: string): void => {
    const filename = basename(entryFile);
    writeFile(
      join(output, 'dist', 'cjs', js(filename, 'js')),
      transpile(read(entryFile), {}));
    writeFile(
      join(output, 'dist', 'esm', js(filename, 'js')),
      transpile(read(entryFile), {module: ModuleKind.ES2015}));
    transpileDeclaration(entryFile, join(output, 'dist', 'types'));
    packageJson({
      main: './dist/cjs/' + js(filename, 'js'),
      module: './dist/esm/' + js(filename, 'js'),
    })(output);
  };
}

function transpile(sourceCode: string, compilerOptions: CompilerOptions): string {
  const output: TranspileOutput = transpileModule(sourceCode, {
    compilerOptions: {...compilerOptions, esModuleInterop: true},
    transformers: {before: [updateImport]},
  });
  return output.outputText;
}

function js(file: string, ext: string): string {
  return file.replace(/\.ts$/, '.' + ext);
}

function writeFile(path: string, content: string): void {
  createDirectory(dirname(path));
  fs.writeFileSync(path, content);
}

function createDirectory(output: string): void {
  fs.mkdirSync(output, {recursive: true});
}

function transpileDeclaration(fileName: string, output: string): void {
  const program: Program = createProgram([fileName], {
    outDir: output,
    declaration: true,
    types: [],
    lib: [],
  });
  program.emit();
}
