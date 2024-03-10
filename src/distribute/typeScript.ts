import {basename, join} from "node:path";
import {type CompilerOptions, createProgram, ModuleKind, type Program} from "typescript";

import {type Operation, packageJson} from "./package.ts";
import {updateImport} from "./updateImport.ts";

export function typeScript(entryFile: string): Operation {
  return (output: string): void => {
    buildTypeScript(entryFile, join(output, 'dist'));
    packageJson({
      main: './dist/cjs/' + ext(basename(entryFile), 'js'),
      module: './dist/esm/' + ext(basename(entryFile), 'js'),
      types: './dist/types/' + ext(basename(entryFile), 'd.ts'),
    })(output);
  };
}

function ext(file: string, ext: string): string {
  return file.replace(/\.ts$/, '.' + ext);
}

function buildTypeScript(entryFile: string, output: string): void {
  transpileDeclaration(entryFile, join(output, 'cjs'), {esModuleInterop: true});
  transpileDeclaration(entryFile, join(output, 'esm'), {module: ModuleKind.ES2015});
  transpileDeclaration(entryFile, join(output, 'types'), {declaration: true, emitDeclarationOnly: true});
}

function transpileDeclaration(entryFile: string, output: string, options: CompilerOptions): void {
  const program: Program = createProgram([entryFile], {
    outDir: output,
    types: [],
    lib: [],
    ...options,
  });
  program.emit(
    undefined,
    undefined,
    undefined,
    undefined,
    {before: [updateImport]},
  );
}
