import {AssertionError} from "node:assert";

import {distribute} from "../../src/package.ts";
import {typeScript} from "../../src/typeScript.ts";
import {Directory, directory} from "./directory.ts";

export type Test = () => void;

export function assertOutputFilename(input: string, expected: string): Test {
  return test(dir => {
    dir.write(input, '');
    distribute(dir.join('output/'), [
      typeScript(dir.join(input)),
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

function test(test: (directory: Directory) => void): Test {
  return () => directory(test);
}
