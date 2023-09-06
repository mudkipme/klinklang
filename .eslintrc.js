module.exports = {
  extends: [
    'standard-with-typescript',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['build', 'dist', 'web_modules', 'node_modules', '.eslintrc.js'],
  parserOptions: {
    project: ['./packages/*/tsconfig.json'],
  },
  root: true,
  rules: {
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
