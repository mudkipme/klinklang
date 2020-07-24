module.exports = {
  extends: 'standard-with-typescript',
  ignorePatterns: ['build', 'dist', 'web_modules', 'node_modules'],
  parserOptions: {
    project: './tsconfig.json'
  }
}
