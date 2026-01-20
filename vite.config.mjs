import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [
      react(),
      visualizer({
        template: "treemap", // or 'sunburst'
        open: true, // opens the browser automatically after build
        gzipSize: true, // shows you the compressed size
        brotliSize: true, // shows brotli size
        filename: "analyse.html", // name of the output file
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "."), // eslint-disable-line
        "@": path.resolve(__dirname, "./src"), // eslint-disable-line
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./vitest.setup.js",
    },
  }
})
