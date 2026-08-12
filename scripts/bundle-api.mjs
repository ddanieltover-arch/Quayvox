import esbuild from 'esbuild';

const outfile = 'api/handler.js';

await esbuild.build({
  entryPoints: ['server/entry.ts'],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: false,
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  // Keep npm deps external — Vercel provides node_modules at runtime.
  // Only our api/_lib + emails code is inlined (fixes missing relative imports).
  packages: 'external',
  logLevel: 'info',
});

console.log(`Bundled API to ${outfile}`);
