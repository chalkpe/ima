import js from '@eslint/js'
import globals from 'globals'
import importAlias from 'eslint-plugin-import-alias'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['coverage', 'dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    plugins: {
      'import-alias': importAlias,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import-alias/import-alias': [
        'error',
        {
          rootDir: '..',
          aliases: [
            { alias: '@ima/client', matcher: '^client[\\\\/]src' },
            { alias: '@ima/server', matcher: '^server[\\\\/]src' },
          ],
        },
      ],
    },
  }
)
