import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
   plugins: [svelte()],
   base: './',
   resolve: { conditions: ['browser'] },
   test: {
      globals: true,
      include: ['src/**/*.test.ts'],
      coverage: {
         reporter: ['text', 'lcov', 'json'],
         include: ['src/**/*.ts', 'src/**/*.svelte'],
         exclude: [
            '**/*.test.ts',
            '**/*fixtures*',
            '**/benchmark-boards.ts',
            'src/main.ts',
            'src/core/solver.worker.ts'
         ]
      }
   }
})
