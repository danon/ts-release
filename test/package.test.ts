import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {add, distribute} from "../src/package.ts";
import {directory} from "./fixture/directory.ts";

suite('distribute()', () => {
  suite('output/', () => {
    test('missing', () =>
      directory(dir => {
        distribute(dir.join('package'), []);
        assert(dir.exists('package/'));
      }));

    test('existing', () =>
      directory(dir => {
        dir.create('package');
        distribute(dir.join('package'), []);
        assert(dir.exists('package/'));
      }));
  });

  suite('add() file', () => {
    test('create file', () =>
      directory(dir => {
        dir.write('LICENSE', '');
        distribute(dir.join('package'), [add(dir.join('LICENSE'))]);
        assert(dir.exists('package/LICENSE'));
      }));

    test('copy content', () =>
      directory(dir => {
        dir.write('LICENSE', 'mit');
        distribute(dir.join('package'), [add(dir.join('LICENSE'))]);
        assert.equal(dir.read('package/LICENSE'), 'mit');
      }));
  });

  test('all steps', () =>
    directory(dir => {
      dir.write('foo', '');
      dir.write('bar', '');
      distribute(dir.join('package'), [
        add(dir.join('foo')),
        add(dir.join('bar')),
      ]);
      assert(dir.exists('package/foo'));
      assert(dir.exists('package/bar'));
    }));
});
