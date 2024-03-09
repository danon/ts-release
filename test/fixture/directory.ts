import fs from "node:fs";
import os from "node:os";
import {dirname, join} from "node:path";

export function directory(callback: (directory: Directory) => void): void {
  callTemporaryDirectory(
    join(os.tmpdir(), 'tUnit.'),
    callback,
  );
}

function callTemporaryDirectory(root: string, callback: (directory: Directory) => void): void {
  const path: string = fs.mkdtempSync(root);
  try {
    callback(new Directory(path));
  } finally {
    fs.rmSync(path, {recursive: true});
  }
}

export class Directory {
  public path: string;

  public constructor(path: string) {
    this.path = path;
  }

  public write(filename: string, content: string): string {
    const path: string = this.join(filename);
    if (!fs.existsSync(dirname(path))) {
      fs.mkdirSync(dirname(path), {recursive: true});
    }
    fs.writeFileSync(path, content);
    return path;
  }

  join(filename: string): string {
    return join(this.path, filename);
  }

  read(filename: string): string {
    return fs.readFileSync(this.join(filename)).toString();
  }

  create(directory: string): void {
    fs.mkdirSync(this.join(directory), {recursive: true});
  }

  exists(filename: string): boolean {
    return fs.existsSync(this.join(filename));
  }

  readJson(filename: string): object {
    return JSON.parse(this.read(filename));
  }

  children(filename: string): string[] {
    return fs.readdirSync(this.join(filename));
  }
}
