// Physical implementation of sourcescript/portable_build/portable_build.py.
// Bundle modules for classic file:// scripts; never write generated JS into sourcecode/.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export async function bundleRuntime() {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const result = await build({
    absWorkingDir: root,
    stdin: {
      contents: "import './sourcecode/system.js';",
      resolveDir: root,
      sourcefile: 'fast-figure-entry.js',
    },
    bundle: true,
    write: false,
    // No remaining import/export in the linked output. The HTML deliberately
    // loads it as a classic script, so file:// does not need an ESM fetch.
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    charset: 'utf8',
    legalComments: 'inline',
    treeShaking: false,
    minify: false,
  });
  return result.outputFiles[0].contents;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { writeFile } = await import('node:fs/promises');
  if (process.argv.length !== 3) throw Error('usage: node portable_build.mjs OUTPUT.js');
  await writeFile(process.argv[2], await bundleRuntime());
}
