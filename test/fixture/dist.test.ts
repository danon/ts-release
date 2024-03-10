import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {directory} from "./directory.ts";
import {distScript} from "./dist.ts";

suite('fixture/', () => {
  suite('dist/', () => {
    test('transpile and distribute', () => directory(tmp => {
      distScript(tmp, 'dist.ts', 'console.log("foo" as string);');
      assert.equal(
        tmp.read('dist/esm/dist.js'),
        'console.log("foo");\n',
      );
    }));
  });
});
