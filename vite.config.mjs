import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { globSync } from "tinyglobby"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(() => {
  return {
		build: {
			// firebase looks for build/ not dist/
			outDir: 'build'
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
			VitePWA({
				registerType: 'autoUpdate',
				devOptions: {
					enabled: true
				},
				manifest: {
					name: 'notestamp',
					short_name: 'notestamp',
					description: 'Write notes synced with media.',
					theme_color: '#ffffff',
					display: 'browser',
				}
			})
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
