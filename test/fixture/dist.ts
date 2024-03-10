import {distribute, typeScript} from "../../src/index.ts";
import {Directory} from "./directory.ts";

export function distScript(directory: Directory, filename: string, content: string): void {
  directory.write(filename, content);
  distribute(directory.path, [typeScript(directory.join(filename))]);
}
