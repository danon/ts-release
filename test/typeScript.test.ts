import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {distribute} from "../src/package.ts";
import {typeScript} from "../src/typeScript.ts";
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
    });

    test('.ts.ts',
      assertOutputFilename('foo.ts.ts', 'foo.ts.js'));

    test('ats',
      assertOutputFilename('ats', 'ats'));

    test('set package.json {main, module}', () =>
      directory(dir => {
        dir.write('input/nest/foo.ts', '');
        distribute(dir.path, [
          typeScript(dir.join('input'), 'nest/foo.ts'),
        ]);
        assert.deepEqual(dir.readJson('package.json'), {
          main: './dist/cjs/nest/foo.js',
          module: './dist/esm/nest/foo.js',
        });
      }));

    suite('extension', () => {
      test('.ts to .js',
        assertTranspile('import "./file.ts";', 'import "./file.js";'));

      test('export',
        assertTranspileIgnore('export * from "./file.ts";'));

      test('trailing .ts',
        assertTranspile('import "./file.ts.ts";', 'import "./file.ts.js";'));

      test('not extension',
        assertTranspile('import "ats";', 'import "ats";'));
    });
  });
});