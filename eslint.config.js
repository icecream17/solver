import js from '@eslint/js'
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import regexp from 'eslint-plugin-regexp'
import sonarjs from 'eslint-plugin-sonarjs'
import vitest from '@vitest/eslint-plugin'
import testingLibrary from 'eslint-plugin-testing-library'
import prettier from 'eslint-config-prettier'
import stylistic from '@stylistic/eslint-plugin'
import svelteConfig from './svelte.config.js'

// Flat-config replacement for .eslintrc. React-only rules no longer apply.
export default ts.config(
   { ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'test-results/**', 'playwright-report/**'] },
   js.configs.recommended,
   ...ts.configs.recommended,
   ...svelte.configs.recommended,
   regexp.configs['flat/recommended'],
   sonarjs.configs.recommended,
   prettier,
   ...svelte.configs.prettier,
   {
      languageOptions: {
         globals: { ...globals.browser, ...globals.node, ...vitest.environments.env.globals },
         parserOptions: { extraFileExtensions: ['.svelte'] }
      },
      plugins: { '@stylistic': stylistic },
      linterOptions: { reportUnusedDisableDirectives: 'error' },
      rules: {
         'no-alert': 'error',
         '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],
         '@stylistic/object-curly-newline': ['error', { ObjectExpression: { minProperties: 2, multiline: true } }],
         'prefer-const': 'warn',
         'prefer-arrow-callback': 'warn',
         'prefer-numeric-literals': 'warn',
         'prefer-promise-reject-errors': 'warn',
         'prefer-regex-literals': 'warn',
         'prefer-rest-params': 'warn',
         'prefer-spread': 'warn',
         '@typescript-eslint/no-explicit-any': 'off',
         '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
         // As in the original config, mathematical algorithms are not flattened
         // just to satisfy a complexity score.
         'sonarjs/cognitive-complexity': 'off',
         'sonarjs/no-nested-functions': 'off',
         'sonarjs/no-nested-conditional': 'off',
         'sonarjs/todo-tag': 'off',
         'sonarjs/parameterized-tests': 'off',
         'sonarjs/use-type-alias': 'off'
      }
   },
   {
      files: ['**/*.svelte'],
      languageOptions: { parserOptions: { parser: ts.parser, svelteConfig } },
      rules: { 'svelte/no-at-html-tags': 'error', 'prefer-const': 'off' }
   },
   {
      files: ['**/*.test.ts'],
      plugins: { vitest },
      rules: {
         ...vitest.configs.recommended.rules,
         'vitest/prefer-to-be': 'error',
         'vitest/prefer-to-contain': 'error',
         'vitest/prefer-to-have-length': 'error',
         'vitest/no-identical-title': 'warn',
         'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'testStrategy'] }]
      }
   },
   {
      files: ['**/*.svelte.ts'],
      languageOptions: { parser: ts.parser }
   },
   {
      files: ['src/core/strategies/**'],
      // These algorithms deliberately test permutations of candidates and cells.
      rules: { 'sonarjs/arguments-order': 'off' }
   },
   {
      files: ['src/App.test.ts', 'src/components/**/*.test.ts'],
      ...testingLibrary.configs['flat/svelte'],
      rules: { ...testingLibrary.configs['flat/svelte'].rules, 'testing-library/no-node-access': 'off', 'testing-library/no-manual-cleanup': 'off' }
   }
)
