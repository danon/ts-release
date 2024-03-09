import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {distribute} from "../src/package.ts";
import {typeScript} from "../src/typeScript.ts";
import {assertOutputFilename, assertTranspile} from "./fixture/assert.ts";
import {directory} from "./fixture/directory.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    suite('target', () => {
      test('transpile to commonJs',
        assertTranspile('cjs', 'import "node:fs";', `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");`));

      test('transpile to esModule',
        assertTranspile('esm', 'import "node:fs";', 'import "node:fs";'));
    });

    test('.ts.ts',
      assertOutputFilename('foo.ts.ts', 'foo.ts.js'));

    test('ats',
      assertOutputFilename('ats', 'ats'));

    test('set package.json {main, module}', () =>
      directory(dir => {
        dir.write('input/foo.ts', '');
        distribute(dir.path, [
          typeScript(dir.join('input/foo.ts')),
        ]);
        assert.deepEqual(dir.readJson('package.json'), {
          main: './dist/cjs/foo.js',
          module: './dist/esm/foo.js',
        });
      }));
  });
});
