import {AssertionError} from "node:assert";

import {distribute, typeScript} from "../../src/index.ts";
import {Directory, directory} from "./directory.ts";

export type Test = () => void;

export function assertOutputFilename(input: string, expected: string): Test {
  return test(dir => {
    dir.write('input/' + input, '');
    distribute(dir.join('output/'), [
      typeScript(dir.join('input/'), ''),
    ]);
    if (!dir.exists('output/dist/cjs/' + expected)) {
      throw new AssertionError({
        message: `Failed to assert that file "${input}" is renamed to "${(expected)}".`,
        expected,
        actual: dir.children('output/dist/cjs/'),
      });
    }
  });
}

export function assertTranspileIgnore(sourceCode: string): Test {
  return assertTranspile(sourceCode, sourceCode);
}

export function assertTranspile(sourceCode: string, expected: string): Test {
  return assertTranspileTarget('esm', sourceCode, expected);
}

export function assertTranspileTarget(target: 'cjs'|'esm', sourceCode: string, expected: string): Test {
  return assertTranspileNewline(target, sourceCode, expected + '\n');
}

function assertTranspileNewline(target: 'cjs'|'esm', sourceCode: string, expected: string): Test {
  return test(dir => {
    dir.write('input/input.ts', sourceCode);
    distribute(dir.join('output'), [typeScript(dir.join('input'), '')]);
    assertIdentical(
      dir.read(`output/dist/${target}/input.js`),
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
