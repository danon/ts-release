import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {distribute} from "../src/package.ts";
import {typeScript} from "../src/typeScript.ts";
import {directory} from "./fixture/tmp.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    suite('target', () => {
      test('transpile to .cjs',
        assertTranspile('import "node:fs";', 'cjs', `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");\n`));

      test('transpile to esm',
        assertTranspile('import "node:fs";', 'esm', 'import "node:fs";\n'));
    });

    test('.ts.ts',
      assertOutputFilename('foo.ts.ts', 'foo.ts.js'));

    test('ats',
      assertOutputFilename('ats', 'ats'));

    test('set package.json {main, module}', () =>
      directory(dir => {
        dir.write('input/nest/foo.ts', '');
        distribute(dir.path, [
          typeScript(dir.join('input'), 'nest/foo.ts'),
        ]);
        assert.deepEqual(dir.readJson('package.json'), {
          main: './dist/cjs/nest/foo.js',
          module: './dist/esm/nest/foo.js',
        });
      }));
  });
});

type Test = () => void;

function assertTranspile(input: string, type: string, expected: string): Test {
  return () => directory(dir => {
    dir.write('input/input.ts', input);
    distribute(dir.join('output'), [typeScript(dir.join('input'), '')]);
    assert.deepEqual(dir.read(`output/dist/${type}/input.js`), expected);
  });
}

function assertOutputFilename(input: string, expected: string): Test {
  return () => directory(dir => {
    dir.write('input/' + input, '');
    distribute(dir.join('package'), [typeScript(dir.join('input'), '')]);
    assert(dir.exists('package/dist/cjs/' + expected));
  });
}
