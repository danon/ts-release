import {argv} from "node:process";

import {add, clear, dependencies, distribute, packageJson, tag, typeScript} from "../src/index.ts";

if (argv.length === 4) {
  release(argv[2], argv[3]);
} else {
  console.error('Invalid command. Usage: {tag} {output}\n\nExample: release-cli.ts 1.24.4 ./dist/package/');
}

function release(version: string, output: string): void {
  distribute(output, [
    clear(),
    add('LICENSE'),
    tag(version),
    packageJson({
      name: '@riddled/ts-release',
      author: 'Daniel Wilkowski',
      license: 'MIT',
    }),
    dependencies('./package.json'),
    typeScript('./src/index.ts'),
  ]);
}
