import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/',
      'dist/',
      '*.config.js',
      '.next/',
      'public',
      '**/__*/**',
      '**/**/_*.ts*',
      '**/*.json',
    ], // Ignore specific files and directories
  },
  ...compat.extends(
    'next/core-web-vitals',
    'next',
    // 'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:jsx-a11y/recommended'
  ),
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-trailing-spaces': 'off',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'react/prop-types': 'off', // Disable prop-types rule for React
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore unused variables starting with _
      'prettier/prettier': ['error', { endOfLine: 'auto' }], // Ensure consistent line endings
      // If you want to disallow the use of the `object` type in TypeScript, use:
    },
  },
];

export default eslintConfig;
