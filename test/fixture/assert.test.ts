import {suite, test} from "mocha";
import assert, {AssertionError} from "node:assert";

import {assertOutputFilename, assertTranspile, type Test} from "./assert.ts";

suite('fixture/', () => {
  suite('assert/', () => {
    suite('assertOutputFilename()', () => {
      test('pass', passes(
        assertOutputFilename('file', 'file')));

      test('fail', fails(
        assertOutputFilename('foo', 'bar'),
        'Failed to assert that file "foo" is renamed to "bar".',
        'bar',
        ['foo']));
    });

    suite('assertTranspile()', () => {
      test('pass', passes(
        assertTranspile('esm', '2;', '2;')));

      test('fail', fails(
        assertTranspile('esm', '"foo";', '"bar";'),
        'Failed to assert that source code was transpiled exactly.',
        '"bar";\n',
        '"foo";\n',
      ));
    });
  });
});

function passes(block: () => void): Test {
  return () => {
    try {
      block();
    } catch (error) {
      throw new AssertionError({message: 'Expected the assertion to pass, but it failed.'});
    }
  };
}

function fails(block: () => void, message: string, expected: string, actual: any): Test {
  return () => {
    try {
      block();
    } catch (error) {
      const assertionError = error as AssertionError;
      assert.equal(assertionError.message, message);
      assert.equal(assertionError.expected, expected);
      assert.deepEqual(assertionError.actual, actual);
      return;
    }
    throw new AssertionError({message: 'Expected the assertion to fail, but it passed.'});
  };
}
