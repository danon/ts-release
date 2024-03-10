import fs from "node:fs";
import {basename, join} from "node:path";

export function distribute(output: string, operations: Operation[]): void {
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }
  operations.forEach(operation => operation(output));
}

export type Operation = (filename: string) => void;

export function add(filename: string): Operation {
  return (output: string): void => {
    fs.writeFileSync(join(output, basename(filename)), read(filename));
  };
}

export function clear(): Operation {
  return (output: string): void => {
    fs.readdirSync(output)
      .map(file => join(output, file))
      .forEach(file => fs.rmSync(file, {recursive: true}));
  };
}

export function tag(version: string): Operation {
  return packageJson({version});
}

export function packageJson(packageJson: object): Operation {
  return (output: string): void => {
    const packageJsonPath = join(output, 'package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify({
      ...readJson(packageJsonPath),
      ...packageJson,
    }));
  };
}

export function dependencies(original: string): Operation {
  return packageJson({
    dependencies: readJson(original).dependencies || {},
  });
}

function readJson(packageJson: string): { [key: string]: string } {
  if (fs.existsSync(packageJson)) {
    return JSON.parse(read(packageJson));
  }
  return {};
}

function read(path: string): string {
  return fs.readFileSync(path).toString();
}
