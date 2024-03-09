import {suite, test} from "mocha";
import assert from "node:assert";
import process from "node:process";

import {find} from "../src/find.ts";
import {directory} from "./fixture/tmp.ts";

suite('distribute()', () => {
  suite('find/', () => {
    test('empty directory', () =>
      directory(dir =>
        assert.deepEqual(find(dir.path), [])));

    test('files in directory', () =>
      directory(dir => {
        dir.write('foo', '');
        dir.write('bar', '');
        assert.deepEqual(find(dir.path), ['bar', 'foo']);
      }));

    test('ignore directory', () =>
      directory(dir => {
        dir.write('foo', '');
        dir.create('bar');
        assert.deepEqual(find(dir.path), ['foo']);
      }));

    test('file in child directory', () =>
      directory(dir => {
        dir.write('foo/file.txt', '');
        assert.deepEqual(find(dir.path), [expected('foo', 'file.txt')]);
      }));

    test('file in nested directories', () =>
      directory(dir => {
        dir.write('foo/bar/file.txt', '');
        assert.deepEqual(find(dir.path), [expected('foo', 'bar', 'file.txt')]);
      }));
  });

  function expected(...paths: string[]): string {
    if (process.platform === 'win32') {
      return paths.join("\\");
    }
    return paths.join('/');
  }
});
