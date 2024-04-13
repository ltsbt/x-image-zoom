import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),
    ],
    build: {
        outDir: 'extension',
        rollupOptions: {
            input: {
                contentScript: path.resolve(__dirname, 'src', 'contentScript.ts'),
                popup: path.resolve(__dirname, 'index.html'),
            },
            output: {
                format: 'es',
                assetFileNames: '[name][extname]',
                chunkFileNames: '[name].js',
                entryFileNames: '[name].js',
            },
        },
    },
});
