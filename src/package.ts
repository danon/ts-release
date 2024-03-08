import fs from "node:fs";
import {basename, join} from "node:path";

export function distribute(output: string, operations: Operation[]): void {
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }
  operations.forEach(operation => operation(output));
}

type Operation = (filename: string) => void;

export function add(filename: string): Operation {
  return (output: string): void => {
    fs.writeFileSync(join(output, basename(filename)), read(filename));
  };
}

function read(path: string): string {
  return fs.readFileSync(path).toString();
}

export function clear(): Operation {
  return (output: string): void => {
    fs.readdirSync(output)
      .map(file => join(output, file))
      .forEach(file => fs.rmSync(file, {recursive: true}));
  };
}

export function tag(version: string): Operation {
  return packageJson({version: version});
}

export function packageJson(packageJson: object): Operation {
  return (output: string): void => {
    fs.writeFileSync(
      join(output, 'package.json'),
      JSON.stringify(packageJson));
  };
}
