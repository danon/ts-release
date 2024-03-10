import {AssertionError} from "node:assert";

import {distribute, typeScript} from "../../src/index.ts";
import {Directory, directory} from "./directory.ts";

export type Test = () => void;

export function assertOutputFilename(input: string, expected: string): Test {
  return test(tmp => {
    tmp.write(input, '');
    distribute(tmp.join('output/'), [
      typeScript(tmp.join(input)),
    ]);
    if (!tmp.exists('output/dist/cjs/' + expected)) {
      throw new AssertionError({
        message: `Failed to assert that file "${input}" is renamed to "${(expected)}".`,
        expected,
        actual: tmp.children('output/dist/cjs/'),
      });
    }
  });
}

export function assertTranspile(sourceCode: string, expected: string): Test {
  return assertTranspileTarget('esm', sourceCode, expected);
}

export function assertTranspileTarget(target: 'cjs'|'esm', sourceCode: string, expected: string): Test {
  return assertTranspileNewline(target, sourceCode, expected + '\n');
}

function assertTranspileNewline(target: 'cjs'|'esm', sourceCode: string, expected: string): Test {
  return test(tmp => {
    tmp.write('input.ts', sourceCode);
    distribute(tmp.join('output'), [typeScript(tmp.join('input.ts'))]);
    assertIdentical(
      tmp.read(`output/dist/${target}/input.js`),
      expected,
      'Failed to assert that source code was transpiled exactly.');
  });
}

function assertIdentical(actual: string, expected: string, message: string): void {
  if (actual !== expected) {
    throw new AssertionError({message, actual, expected});
  }
}

function test(test: (directory: Directory) => void): Test {
  return () => directory(test);
}
