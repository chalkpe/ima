import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importAlias from 'eslint-plugin-import-alias'
import storybook from 'eslint-plugin-storybook'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'storybook-static'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import-alias': importAlias,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'import-alias/import-alias': [
        'error',
        {
          rootDir: '..',
          aliases: [
            { alias: '@ima/client', matcher: '^client/src' },
            { alias: '@ima/server', matcher: '^server/src' },
          ],
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended']
)
