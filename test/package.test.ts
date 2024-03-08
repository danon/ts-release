import {test} from "mocha";
import {strict as assert} from "node:assert";

import {add, clear, distribute, packageJson, tag} from "../src/package.ts";
import {directory} from "./fixture/tmp.ts";

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

  suite('clear() output/', () => {
    test('file', () =>
      directory(dir => {
        dir.write('package/file', '');
        distribute(dir.join('package'), [clear()]);
        assert(!dir.exists('package/file'));
      }));

    test('directory', () =>
      directory(dir => {
        dir.create('package/dir');
        distribute(dir.join('package'), [clear()]);
        assert(!dir.exists('package/dir'));
      }));

    test('nested directory', () =>
      directory(dir => {
        dir.create('package/foo/bar');
        distribute(dir.join('package'), [clear()]);
        assert(!dir.exists('package/foo'));
      }));
  });

  test('packageJson()', () =>
    directory(dir => {
      distribute(dir.path, [packageJson({name: 'winter'})]);
      assert.deepEqual(
        dir.readJson('package.json'),
        {name: 'winter'});
    }));

  suite('tag() package.json', () => {
    test('create package.json', () =>
      directory(dir => {
        distribute(dir.path, [tag('')]);
        assert(dir.exists('package.json'));
      }));

    test('tag package.json', () =>
      directory(dir => {
        distribute(dir.path, [tag('1.0.0')]);
        assert.deepEqual(
          dir.readJson('package.json'),
          {version: '1.0.0'});
      }));
  });
});
