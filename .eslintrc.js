module.exports = {
  extends: [
    'standard-with-typescript',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['build', 'dist', 'web_modules', 'node_modules', 'klinklang-prisma', '.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json'
  },
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
