import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {assertTranspile, assertTranspileTarget} from "./fixture/assert.ts";
import {executeTypeScript} from "./fixture/execute.ts";

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
  });
});
