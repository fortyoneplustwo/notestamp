import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "."),
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
