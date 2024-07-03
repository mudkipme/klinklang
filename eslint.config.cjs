const love = require('eslint-config-love')
const reactHooks = require('eslint-plugin-react-hooks')

module.exports = [
  {
    ...love,
    files: ['packages/**/*.ts', 'packages/**/*.tsx'],
    plugins: {
      ...love.plugins,
      'react-hooks': reactHooks
    },
    languageOptions: {
      ...love.languageOptions,
      parserOptions: {
        project: ['./packages/*/tsconfig.json']
      }
    },
    ignores: ['build', 'dist', 'node_modules', 'eslint.config.cjs'],
    rules: {
      ...love.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            properties: false
          }
        }
      ]
    }
  }
]
