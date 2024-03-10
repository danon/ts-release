import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {distribute, typeScript} from "../src/index.ts";
import {assertOutputFilename, assertTranspile, assertTranspileIgnore, assertTranspileTarget} from "./fixture/assert.ts";
import {directory} from "./fixture/directory.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    suite('target', () => {
      test('transpile to commonJs',
        assertTranspileTarget('cjs', 'import "node:fs";', `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");`));

      test('transpile to esModule',
        assertTranspileTarget('esm', 'import "node:fs";', 'import "node:fs";'));

      test('emit declaration',
        assertTranspileTarget('types',
          'export interface Foo {}\nsideEffect();',
          'export interface Foo {\n}'));

      test('declaration without source', () =>
        directory(dir => {
          dir.write('foo.ts', '');
          distribute(dir.path, [typeScript(dir.join('foo.ts'))]);
          assert(!dir.exists('dist/types/foo.js'));
        }));
    });

    test('.ts.ts',
      assertOutputFilename('foo.ts.ts', 'foo.ts.js'));

    test('set package.json {main, module, types}', () =>
      directory(dir => {
        dir.write('foo.ts', '');
        distribute(dir.path, [typeScript(dir.join('foo.ts'))]);
        assert.deepEqual(dir.readJson('package.json'), {
          main: './dist/cjs/foo.js',
          module: './dist/esm/foo.js',
          types: './dist/types/foo.d.ts',
        });
      }));

    suite('extension', () => {
      test('.ts to .js',
        assertTranspile('import "./file.ts";', 'import "./file.js";'));

      test('trailing .ts',
        assertTranspile('import "./file.ts.ts";', 'import "./file.ts.js";'));

      test('not extension',
        assertTranspile('import "ats";', 'import "ats";'));

      test('export from',
        assertTranspile('export * from "./file.ts";', 'export * from "./file.js";'));

      test('export',
        assertTranspileIgnore('export { value };'));

      test('require()',
        assertTranspileTarget('cjs',
          'import "./file.ts";',
          `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./file.js");`));
    });

    suite('imported file', () => {
      const file: string = 'export const x = 5;';
      const index: string = `
        import {x} from "./file.ts";
        console.log(x);
      `;

      test('commonJs', () =>
        assertImportedFile('cjs', `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.x = void 0;
exports.x = 5;
`));

      test('esModule', () =>
        assertImportedFile('esm', `export var x = 5;\n`));

      test('declaration', () =>
        assertImportedFile('types', 'export declare const x = 5;\n'));

      function assertImportedFile(target: 'cjs'|'esm'|'types', expected: string): void {
        directory(dir => {
          dir.write('file.ts', file);
          dir.write('index.ts', index);
          distribute(dir.path, [typeScript(dir.join('index.ts'))]);
          assert.equal(
            dir.read(`dist/${target}/file.` + (target === 'types' ? 'd.ts' : 'js')),
            expected,
          );
        });
      }
    });
  });
});
