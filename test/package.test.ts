import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {add, distribute} from "../src/package.ts";
import {directory} from "./fixture/directory.ts";

suite('distribute()', () => {
  suite('output path', () => {
    test('missing', () =>
      directory(tmp => {
        distribute(tmp.join('package'), []);
        assert(tmp.exists('package/'));
      }));

    test('existing', () =>
      directory(tmp => {
        tmp.create('package');
        distribute(tmp.join('package'), []);
        assert(tmp.exists('package/'));
      }));
  });

  suite('add() file', () => {
    test('create file', () =>
      directory(tmp => {
        tmp.write('LICENSE', '');
        distribute(tmp.join('package'), [add(tmp.join('LICENSE'))]);
        assert(tmp.exists('package/LICENSE'));
      }));

    test('copy content', () =>
      directory(tmp => {
        tmp.write('LICENSE', 'mit');
        distribute(tmp.join('package'), [add(tmp.join('LICENSE'))]);
        assert.equal(
          tmp.read('package/LICENSE'),
          'mit',
        );
      }));
  });
});
