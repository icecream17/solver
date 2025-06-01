import { defineConfig } from 'vite'

import wasm from "vite-plugin-wasm"

export default defineConfig({
   root: '.',
   build: {
      target: 'esnext',
      modulePreload: {
         polyfill: false,
      },
      outDir: 'dist',
      sourcemap: true,
   },
   server: {
      open: 'index.html'
   },
   plugins: [
      wasm(),
   ]
})
