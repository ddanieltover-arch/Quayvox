import esbuild from 'esbuild';

const outfile = 'api/handler.js';

await esbuild.build({
  entryPoints: ['server/entry.ts'],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: true,
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  logLevel: 'info',
});

console.log(`Bundled API to ${outfile}`);
