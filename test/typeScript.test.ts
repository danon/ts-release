import {strict as assert} from "assert";
import {test} from "mocha";

import {distribute} from "../src/package.ts";
import {typeScript} from "../src/typeScript.ts";
import {directory} from "./fixture/tmp.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    test('transpile to .cjs', () =>
      directory(dir => {
        // given
        dir.write('input/nest/foo.ts', 'import "node:fs";');
        // when
        distribute(dir.join('package'), [typeScript(dir.join('input'))]);
        // then
        assert.deepEqual(dir.read('package/dist/cjs/nest/foo.js'), `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");\n`);
      }));
  });
});
