module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],

    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        // project: ['./tsconfig.json'], // only for type-aware rules (slower)
      },
    },

    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      prettier: require('eslint-plugin-prettier'),
    },

    rules: {
      // Prettier: report formatting issues as ESLint problems
      'prettier/prettier': ['error'],

      // sensible defaults
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': 'warn',
    },

    // ignore these globs when linting
    ignores: ['dist/**', 'node_modules/**', 'frontend/**'],
  },
];
