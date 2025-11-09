import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { tanstackRouter } from "@tanstack/router-plugin/vite"

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
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
