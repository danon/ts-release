import {suite, test} from "mocha";
import assert from "node:assert";

import {executeTypeScript} from "./fixture/execute.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    suite('interop', () => {
      test('commonJs',
        () => assertInterop('cjs'));

      test('esModule',
        () => assertInterop('esm'));

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
