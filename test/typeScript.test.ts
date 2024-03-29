import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {assertTranspile, assertTranspileTarget} from "./fixture/assert.ts";
import {directory} from "./fixture/directory.ts";
import {distScript} from "./fixture/dist.ts";
import {executeTypeScript} from "./fixture/execute.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    test('commonJs',
      assertTranspileTarget('cjs', 'import "node:fs";', `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");`));

    test('esModule',
      assertTranspileTarget('esm', 'import "node:fs";', 'import "node:fs";'));

    test('emit declaration',
      assertTranspileTarget('types',
        'export interface Foo {}\nsideEffect();',
        'export interface Foo {\n}'));

    test('declaration without source', () =>
      directory(tmp => {
        distScript(tmp, 'source.ts', '');
        assert(!tmp.exists('dist/types/source.js'));
      }));

    suite('import ".ts" to ".js"', () => {
      test('update extension',
        assertTranspile('import "./file.ts";', 'import "./file.js";'));

      test('only trailing .ts',
        assertTranspile('import "./file.ts.ts";', 'import "./file.ts.js";'));

      test('not an extension',
        assertTranspile('import "ats";', 'import "ats";'));

      test('export * from',
        assertTranspile('export * from "./file.ts";', 'export * from "./file.js";'));

      test('export {}',
        assertTranspile('export { value };', 'export { value };'));

      test('require()',
        assertTranspileTarget('cjs',
          'import "./file.ts";',
          `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./file.js");`));
    });

    suite('import default from commonJs', () => {
      test('commonJs', () =>
        assertInterop('cjs'));

      test('esModule', () =>
        assertInterop('esm'));

      function assertInterop(target: 'cjs'|'esm'): void {
        const output: string = executeTypeScript(target, `
          import path from "node:path";
          console.log(path.join('foo'));
        `);
        assert.equal(output, 'foo\n');
      }
    });

    suite('include imported "./file.ts"', () => {
      test('esModule', () =>
        assertImportedFile(
          'esm',
          'export const val = 5;',
          `export var val = 5;\n`));

      test('commonJs', () =>
        assertImportedFile(
          'cjs',
          'export const val = 5;',
          `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.val = void 0;
exports.val = 5;
`));

      function assertImportedFile(target: 'cjs'|'esm', sourceCode: string, alsoIncluded: string): void {
        directory(tmp => {
          tmp.write('imported.ts', sourceCode);
          distScript(tmp, 'main.ts', `
            import {val} from "./imported.ts";
            console.log(val);
          `);
          assert.equal(tmp.read(`dist/${target}/imported.js`), alsoIncluded);
        });
      }
    });

    suite('package.json', () => {
      test('set {main}', () =>
        assertPackageJsonField('dog.ts', 'main', './dist/cjs/dog.js'));

      test('set {module}', () =>
        assertPackageJsonField('cat.ts', 'module', './dist/esm/cat.js'));

      test('set {types}', () =>
        assertPackageJsonField('fish.ts', 'types', './dist/types/fish.d.ts'));

      test('trailing .ts', () =>
        assertPackageJsonField('fish.ts.ts', 'main', './dist/cjs/fish.ts.js'));

      test('not an extension', () =>
        assertPackageJsonField('ats', 'main', './dist/cjs/ats'));

      function assertPackageJsonField(filename: string, key: string, expected: string): void {
        directory(tmp => {
          distScript(tmp, filename, '');
          assert.equal(tmp.readJsonField('package.json', key), expected);
        });
      }
    });
  });
});
