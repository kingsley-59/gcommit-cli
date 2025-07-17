// esbuild.config.js
import { build } from 'esbuild';

(async () => {
  await build({
    entryPoints: ['src/index.ts'],

    bundle: true,
    platform: 'node',

    // ← change this:
    format: 'cjs',

    target: 'node22',

    // you can still call it .js if you like,
    // but I recommend .cjs so Node knows its CJS:
    outfile: 'dist/index.cjs',

    sourcemap: true,
  })
})()
