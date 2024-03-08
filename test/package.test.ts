import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {add, clear, dependencies, distribute, packageJson, tag} from "../src/package.ts";
import {directory} from "./fixture/directory.ts";

suite('distribute()', () => {
  suite('output path', () => {
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

  suite('clear() output path', () => {
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

  suite('packageJson()', () => {
    test('create file', () =>
      directory(dir => {
        distribute(dir.path, [packageJson({name: 'winter'})]);
        assert.deepEqual(
          dir.readJson('package.json'),
          {name: 'winter'});
      }));

    test('maintain package.json', () =>
      directory(dir => {
        distribute(dir.path, [
          tag('1.0.0'),
          packageJson({name: 'winter'}),
        ]);
        assert.deepEqual(
          dir.readJson('package.json'),
          {version: '1.0.0', name: 'winter'});
      }));
  });

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

    test('maintain package.json', () =>
      directory(dir => {
        distribute(dir.path, [
          packageJson({name: 'winter'}),
          tag('1.0.0'),
        ]);
        assert.deepEqual(
          dir.readJson('package.json'),
          {name: 'winter', version: '1.0.0'});
      }));
  });

  suite('dependencies() from package.json', () => {
    test('missing key', () =>
      directory(dir => {
        dir.write('template.json', '{}');
        distribute(dir.join('package'), [dependencies(dir.join('template.json'))]);
        assert.deepEqual(
          dir.readJson('package/package.json'),
          {dependencies: {}});
      }));

    test('from original', () =>
      directory(dir => {
        dir.write('template.json', JSON.stringify({dependencies: {mocha: '*'}}));
        distribute(dir.join('package'), [dependencies(dir.join('template.json'))]);
        assert.deepEqual(
          dir.readJson('package/package.json'),
          {dependencies: {mocha: '*'}});
      }));
  });
});
