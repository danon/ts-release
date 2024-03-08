import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {add, clear, distribute, tag} from "../src/package.ts";
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
        assert.equal(tmp.read('package/LICENSE'), 'mit');
      }));
  });

  test('all steps', () =>
    directory(tmp => {
      tmp.write('foo', '');
      tmp.write('bar', '');
      distribute(tmp.join('package'), [
        add(tmp.join('foo')),
        add(tmp.join('bar')),
      ]);
      assert(tmp.exists('package/foo'));
      assert(tmp.exists('package/bar'));
    }));

  suite('clear() output path', () => {
    test('file', () =>
      directory(tmp => {
        tmp.write('package/file', '');
        distribute(tmp.join('package'), [clear()]);
        assert(!tmp.exists('package/file'));
      }));

    test('directory', () =>
      directory(tmp => {
        tmp.create('package/dir');
        distribute(tmp.join('package'), [clear()]);
        assert(!tmp.exists('package/dir'));
      }));

    test('nested directory', () =>
      directory(tmp => {
        tmp.create('package/foo/bar');
        distribute(tmp.join('package'), [clear()]);
        assert(!tmp.exists('package/foo'));
      }));
  });

  suite('tag() package.json', () => {
    test('create package.json', () =>
      directory(tmp => {
        distribute(tmp.path, [tag('')]);
        assert(tmp.exists('package.json'));
      }));

    test('tag package.json', () =>
      directory(tmp => {
        distribute(tmp.path, [tag('1.0.0')]);
        assert.deepEqual(
          JSON.parse(tmp.read('package.json')),
          {version: '1.0.0'});
      }));
  });
});
