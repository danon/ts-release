import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {distribute} from "../src/package.ts";
import {typeScript} from "../src/typeScript.ts";
import {directory} from "./fixture/tmp.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    suite('target', () => {
      test('transpile to .cjs',
        assertTranspileTarget('cjs', 'import "node:fs";', `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");`));

      test('transpile to esm',
        assertTranspileTarget('esm', 'import "node:fs";', 'import "node:fs";'));
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

    suite('extension', () => {
      test('.ts to .js',
        assertTranspile('import "./file.ts";', 'import "./file.js";'));

      test('export',
        assertTranspileIgnore('export * from "./file.ts";'));

      test('trailing .ts',
        assertTranspile('import "./file.ts.ts";', 'import "./file.ts.js";'));

      test('not extension',
        assertTranspile('import "ats";', 'import "ats";'));

      test('require()',
        assertTranspileTarget('cjs',
          'import "./file.ts";',
          `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./file.js");`));
    });
  });
});

type Test = () => void;

function assertTranspileIgnore(input: string): Test {
  return assertTranspileTarget('esm', input, input);
}

function assertTranspile(input: string, expected: string): Test {
  return assertTranspileTarget('esm', input, expected);
}

function assertTranspileTarget(target: string, sourceCode: string, expected: string): Test {
  return () => directory(dir => {
    // given
    dir.write('input/input.ts', sourceCode);
    // when
    distribute(dir.join('output'), [typeScript(dir.join('input'), '')]);
    // then
    assert.deepEqual(
      dir.read(`output/dist/${target}/input.js`),
      expected + "\n");
  });
}

function assertOutputFilename(input: string, expected: string): Test {
  return () => directory(dir => {
    // given
    dir.write('input/' + input, '');
    // when
    distribute(dir.join('package'), [typeScript(dir.join('input'), '')]);
    // then
    assert(dir.exists('package/dist/cjs/' + expected));
  });
}
