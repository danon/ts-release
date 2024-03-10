import {suite, test} from "mocha";

import {assertTranspile, assertTranspileTarget} from "./fixture/assert.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    test('commonJs',
      assertTranspileTarget('cjs', 'import "node:fs";', `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");`));

    test('esModule',
      assertTranspileTarget('esm', 'import "node:fs";', 'import "node:fs";'));

    suite('import ".ts" to ".js"', () => {
      test('update extension',
        assertTranspile('import "./file.ts";', 'import "./file.js";'));

      test('only trailing .ts',
        assertTranspile('import "./file.ts.ts";', 'import "./file.ts.js";'));

      test('not an extension',
        assertTranspile('import "ats";', 'import "ats";'));

      test('export * from',
        assertTranspile('export * from "./file.ts";', 'export * from "./file.js";'));
    });
  });
});
