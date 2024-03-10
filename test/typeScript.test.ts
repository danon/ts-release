import {suite, test} from "mocha";

import {assertTranspile} from "./fixture/assert.ts";

suite('distribute()', () => {
  suite('typeScript()', () => {
    test('commonJs',
      assertTranspile('cjs', 'import "node:fs";', `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("node:fs");`));

    test('esModule',
      assertTranspile('esm', 'import "node:fs";', 'import "node:fs";'));
  });
});
