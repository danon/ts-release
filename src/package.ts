import fs from "node:fs";
import {basename, join} from "node:path";

export function distribute(output: string, operations: Operation[]): void {
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }
  if (operations.length) {
    operations[0](output);
  }
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
