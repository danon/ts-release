import {suite, test} from "mocha";
import assert from "node:assert";

import {executeTypeScript} from "./execute.ts";

suite('fixture/', () => {
  suite('execute/', () => {
    test('esModule', () => {
      assert.equal(
        executeTypeScript('esm', 'console.log("foo" as string);'),
        'foo\n');
    });

    test('commonJs', () => {
      assert.equal(
        executeTypeScript('cjs', 'console.log("bar" as string);'),
        'bar\n');
    });

    test('syntax error', () => {
      const errorMessage = executionError(() =>
        executeTypeScript('esm', 'foo;'));

      assert(errorMessage.includes('foo is not defined'));
    });
  });
});

function executionError(block: () => string): string {
  try {
    block();
  } catch (error) {
    return (error as Error).message;
  }
  assert(false);
}
