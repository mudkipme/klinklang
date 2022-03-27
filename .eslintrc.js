module.exports = {
  extends: 'standard-with-typescript',
  ignorePatterns: ['build', 'dist', 'web_modules', 'node_modules', 'klinklang-prisma'],
  parserOptions: {
    project: './tsconfig.json'
  }
}
