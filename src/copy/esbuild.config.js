// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
require('esbuild').buildSync({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'build/index.js',
    platform: 'node',
});
