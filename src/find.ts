import fs from "node:fs";
import {join} from "node:path";

export function find(path: string): string[] {
  return findRecursively(path, '');
}

function findRecursively(rootPath: string, path: string): string[] {
  return children(join(rootPath, path))
    .flatMap((file: string): string[] => {
      if (isDirectory(join(rootPath, path, file))) {
        return findRecursively(rootPath, join(path, file));
      }
      return [join(path, file)];
    });
}

function children(path: string): string[] {
  return fs.readdirSync(path);
}

function isDirectory(path: string): boolean {
  return fs.lstatSync(path).isDirectory();
}
