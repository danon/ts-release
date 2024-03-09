import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {distribute} from "../src/package.ts";
import {typeScript} from "../src/typeScript.ts";
import {directory} from "./fixture/directory.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    test('commonJs', () =>
      directory(tmp => {
        // given
        tmp.write('foo.ts', 'import "node:fs";');
        // when
        distribute(tmp.join('package'), [typeScript(tmp.join('foo.ts'))]);
        // then
        assert.deepEqual(tmp.read('package/dist/cjs/foo.js'), `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");\n`);
      }));
  });
});
