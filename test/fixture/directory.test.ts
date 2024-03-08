import {suite, test} from "mocha";
import {strict as assert} from "node:assert";
import fs from "node:fs";
import os from "node:os";
import {join} from "node:path";
import process from "node:process";

import {directory} from "./directory.ts";

suite('fixture/', () => {
  suite('directory() temporary', () => {
    test('callback', () => {
      let called: boolean = false;
      directory(() => called = true);
      assert(called);
    });

    test('path', () =>
      directory(dir => assert(dir.path.startsWith(expectedTmp()))));

    test('unique paths', () => {
      let previous: string|null = null;
      directory(dir => previous = dir.path);
      directory(dir => assert(previous !== dir.path));
    });

    test('create directory', () =>
      directory(dir => assert(fs.existsSync(dir.path))));

    test('remove directory', () => {
      let previous: string|null = null;
      directory(dir => previous = dir.path);
      assert(!fs.existsSync(previous!));
    });

    test('remove directory with children', () =>
      directory(dir =>
        fs.writeFileSync(join(dir.path, 'file.txt'), '')));

    test('remove directory with exception', () => {
      let previous: string|null = null;
      try {
        directory(dir => {
          previous = dir.path;
          throw new Error('');
        });
      } catch (expected) {
        assert(!fs.existsSync(previous!));
      }
    });

    suite('.write() child', () => {
      test('create file', () =>
        directory(dir => {
          dir.write('file.txt', '');
          assert(fs.existsSync(join(dir.path, 'file.txt')));
        }));

      test('write to file', () =>
        directory(dir => {
          dir.write('file.txt', 'content');
          assert.equal(
            fs.readFileSync(join(dir.path, 'file.txt')).toString(),
            'content',
          );
        }));

      test('return path', () =>
        directory(dir => {
          const path = dir.write('file.txt', 'content');
          assert.equal(path, join(dir.path, 'file.txt'));
        }));

      test('missing directory', () =>
        directory(dir => {
          dir.write('missing/file.txt', 'content');
          assert.equal(
            fs.readFileSync(join(dir.path, 'missing', 'file.txt')).toString(),
            'content',
          );
        }));

      test('nested parent', () =>
        directory(dir => {
          dir.write('foo/bar/file.txt', 'content');
          assert.equal(
            fs.readFileSync(join(dir.path, 'foo', 'bar', 'file.txt')).toString(),
            'content',
          );
        }));
    });

    test('.read() child', () =>
      directory(dir => {
        fs.writeFileSync(join(dir.path, 'file.txt'), 'content');
        assert.equal(
          dir.read('file.txt'),
          'content',
        );
      }));

    test('.join() path', () =>
      directory(dir =>
        assert.equal(
          dir.join('file'),
          join(dir.path, 'file'),
        )));

    suite('.create() directory', () => {
      test('create', () =>
        directory(dir => {
          dir.create('nested');
          assert(fs.existsSync(join(dir.path, 'nested')));
        }));

      test('is directory', () =>
        directory(dir => {
          dir.create('nested');
          assert(fs.lstatSync(join(dir.path, 'nested')).isDirectory());
        }));

      test('nested directory', () =>
        directory(dir => {
          dir.create('foo/bar');
          assert(fs.existsSync(join(dir.path, 'foo', 'bar')));
        }));
    });

    suite('exists()', () => {
      test('missing', () =>
        directory(dir =>
          assert(!dir.exists('foo'))));

      test('existing', () =>
        directory(dir => {
          dir.write('foo', '');
          assert(dir.exists('foo'));
        }));
    });
  });

  function expectedTmp(): string {
    if (process.platform === 'win32') {
      return os.homedir() + '\\AppData\\Local\\Temp\\tUnit.';
    }
    return '/tmp/tUnit.';
  }
});
