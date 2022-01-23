module.exports = {
    root: true,
    env: {
      es2020: true,
      node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2020,
      tsconfigRootDir: __dirname,
      project: ['./tsconfig.eslint.json']
    },
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'prettier',
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-unsafe-call": 0,
      "@typescript-eslint/no-unsafe-member-access": 0,
      "@typescript-eslint/no-unsafe-return": 0,
      "@typescript-eslint/no-unsafe-assignment": 0,
    },
};