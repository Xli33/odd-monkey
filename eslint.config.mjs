import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    ignores: ['.husky/']
  },
  {
    files: ['*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['src/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.greasemonkey,
        ...globals.jquery,
        Swal: 'readonly'
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-unused-vars': [
        'error',
        {
          // vars: 'all',
          // args: 'after-used',
          caughtErrors: 'none'
          // ignoreRestSiblings: false,
          // reportUsedIgnorePattern: false
        }
      ],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
];
