import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { globSync } from "tinyglobby"

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
      /** Custom plugins */
      { // Generate virtual:media/config module at build time
        name: "media-module-resolver-plugin",
        resolveId(id) {
          if (id === "virtual:media/config") {
            return `\0${id}`
          }
        },
        async load(id) {
          if (id === "\0virtual:media/config") {
            const paths = globSync(
              "src/components/MediaRenderer/media/*/config.js",
              { cwd: "." }
            ).map(rel => path.resolve(__dirname, rel)) // eslint-disable-line
            const configs = {}
            for (const path of paths) {
              const splitPath = path.split("/")
              const key = splitPath[splitPath.length - 2]
              const val = await import(path)
              configs[key] = val?.default
            }
            // TODO: validate config before returning
            return `export const configs = ${JSON.stringify(configs, null, 2)}`
          }
        },
      },
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
