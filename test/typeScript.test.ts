import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {distribute} from "../src/package.ts";
import {typeScript} from "../src/typeScript.ts";
import {assertOutputFilename} from "./fixture/assert.ts";
import {directory} from "./fixture/directory.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    test('transpile to commonJs', () =>
      directory(dir => {
        // given
        dir.write('input/nest/foo.ts', 'import "node:fs";');
        // when
        distribute(dir.join('package'), [typeScript(dir.join('input'), '')]);
        // then
        assert.deepEqual(dir.read('package/dist/cjs/nest/foo.js'), `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");\n`);
      }));

    test('.ts.ts',
      assertOutputFilename('foo.ts.ts', 'foo.ts.js'));

    test('ats',
      assertOutputFilename('ats', 'ats'));

    test('set package.json {main}', () =>
      directory(dir => {
        dir.write('input/nest/foo.ts', '');
        distribute(dir.path, [
          typeScript(dir.join('input'), 'nest/foo.ts'),
        ]);
        assert.deepEqual(dir.readJson('package.json'), {main: './dist/cjs/nest/foo.js'});
      }));
  });
});
