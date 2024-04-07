import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: "extension",
    rollupOptions: {
      input: {
        contentScript: path.resolve(__dirname, "src", "contentScript.ts"),
        popup: path.resolve(__dirname, "index.html"),
      },
      output: {
        assetFileNames: "[name][extname]",
        chunkFileNames: "[name].js",
        entryFileNames: "[name].js",
      },
    },
  },
});
