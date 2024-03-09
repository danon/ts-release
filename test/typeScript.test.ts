import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {distribute} from "../src/package.ts";
import {typeScript} from "../src/typeScript.ts";
import {directory} from "./fixture/directory.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    test('transpile to commonJs', () =>
      directory(dir => {
        // given
        dir.write('input/foo.ts', 'import "node:fs";');
        // when
        distribute(dir.join('package'), [typeScript(dir.join('input/foo.ts'))]);
        // then
        assert.deepEqual(dir.read('package/dist/cjs/foo.js'), `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");\n`);
      }));
  });
});
