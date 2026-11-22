// news-image-20261122 — "The World in One Image", Sunday 22 November 2026.
//
// The front page is entry.png, drawn entirely in code from frontpage.html
// (re-render it any time with `node render.cjs`). This program's only job is
// delivery: hand those exact bytes to the grader by copying entry.png into
// the output directory. The grader mounts the output directory at /output;
// anywhere else, point MAKEFUN_OUTPUT_DIR at a folder to stand in for it:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Node 22, standard library only, no network.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function deliver(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const bytes = readFileSync(join(here, 'entry.png'));

  // The gate reads the file by its first bytes, so refuse to hand over
  // anything that is not a whole PNG.
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!bytes.subarray(0, 8).equals(pngSignature)) {
    throw new Error('entry.png is not a PNG');
  }
  if (bytes.length > 1048576) {
    throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
  }

  const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const target = join(targetDir, 'entry.png');

  writeFileSync(target, bytes);

  // The judge scores exactly the bytes copied, so fail loudly rather than
  // hand over a truncated page if the copy ever comes up short.
  const copied = readFileSync(target);
  if (copied.length !== bytes.length) {
    throw new Error(`entry.png copy mismatch: wrote ${copied.length} of ${bytes.length} bytes`);
  }
  console.log(`delivered entry.png (${bytes.length} bytes) to ${target}`);
}

deliver();
