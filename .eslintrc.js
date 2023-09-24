module.exports = {
  env: {
    browser: true,
    es6: true,
    commonjs: true,
    node: true,
  },
  globals: { JSX: 'readonly' },
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:react/recommended',
  ],
  ignorePatterns: [
    '**/node_modules/**/*',
    '**/lib/**/*',
    '**/_*.ts',
    '**/_*.d.ts',
    '**/typings/**/*.d.ts',
    '**/dist/*',
    'js/.eslintrc.js',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.eslint.json',
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-case-declarations': 'warn',
    'no-control-regex': 'warn',
    'no-inner-declarations': 'off',
    'no-prototype-builtins': 'off',
    'no-undef': 'warn',
    'no-useless-escape': 'off',
    'prefer-const': 'off',
    'import/no-unresolved': 'off',
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'parent',
          'sibling',
          'index',
          'object',
          'unknown',
        ],
        pathGroups: [
          {
            pattern: 'react/**',
            group: 'builtin',
            position: 'after',
          },
          {
            pattern: 'codemirror/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@lumino/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@jupyterlab/**',
            group: 'external',
            position: 'after',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
        },
      },
    ],
    // deviations from jupyterlab, should probably be fixed
    'import/no-cycle': 'off', // somehow we lapsed here... ~200 cycles now
    'import/export': 'off', // we do class/interface + NS pun exports _all over_
    '@typescript-eslint/triple-slash-reference': 'off',
    'no-async-promise-executor': 'off',
    'prefer-spread': 'off',
    'react/display-name': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
