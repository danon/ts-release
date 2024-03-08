import {suite, test} from "mocha";
import {strict as assert} from "node:assert";

import {add, clear, dependencies, distribute, packageJson, tag} from "../src/package.ts";
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

  suite('packageJson()', () => {
    test('create file', () =>
      directory(tmp => {
        distribute(tmp.path, [packageJson({name: 'winter'})]);
        assert.deepEqual(
          tmp.readJson('package.json'),
          {name: 'winter'});
      }));

    test('maintain package.json', () =>
      directory(tmp => {
        distribute(tmp.path, [
          tag('1.0.0'),
          packageJson({name: 'winter'}),
        ]);
        assert.deepEqual(
          tmp.readJson('package.json'),
          {version: '1.0.0', name: 'winter'});
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
          tmp.readJson('package.json'),
          {version: '1.0.0'});
      }));

    test('maintain package.json', () =>
      directory(tmp => {
        distribute(tmp.path, [
          packageJson({name: 'winter'}),
          tag('1.0.0'),
        ]);
        assert.deepEqual(
          tmp.readJson('package.json'),
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
