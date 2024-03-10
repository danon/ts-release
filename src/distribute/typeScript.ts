import {join} from "node:path";
import {type CompilerOptions, createProgram, ModuleKind, type Program} from "typescript";

import {type Operation} from "./package.ts";
import {updateImport} from "./updateImport.ts";

export function typeScript(entryFile: string): Operation {
  return (output: string): void => {
    buildTypeScript(entryFile, output);
  };
}

function buildTypeScript(entryFile: string, output: string): void {
  transpileTypeScript(entryFile, output, 'cjs', {esModuleInterop: true});
  transpileTypeScript(entryFile, output, 'esm', {module: ModuleKind.ES2015});
  transpileTypeScript(entryFile, output, 'types', {declaration: true, emitDeclarationOnly: true});
}

function transpileTypeScript(entryFile: string, output: string, target: string, options: CompilerOptions): void {
  const program: Program = createProgram([entryFile], {
    ...options,
    outDir: join(output, 'dist', target),
    types: [],
    lib: [],
  });
  program.emit(undefined, undefined, undefined, undefined,
    {before: [updateImport]});
}
