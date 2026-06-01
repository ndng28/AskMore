import globals from 'globals';

const AI_SLOP_RULES = {
  // 🔍 AI debugging artifacts
  'no-console': 'warn',
  'no-alert': 'warn',

  // 🚫 Empty blocks (AI skips error handling)
  'no-empty': ['error', { allowEmptyCatch: false }],

  // 🗑️ Dead code
  'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  'prefer-const': 'error',
  'no-var': 'error',

  // 🔒 Security
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-throw-literal': 'error',

  // 🧠 Complexity gates (AI slop prevention)
  complexity: ['warn', 10],
  'max-depth': ['warn', 4],
  'max-lines-per-function': ['warn', 50],
  'max-params': ['warn', 4],
  'max-nested-callbacks': ['warn', 3],

  // ✨ Clean code
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  curly: ['error', 'all'],

  // 🏷️ AI placeholder comments
  'no-warning-comments': [
    'warn',
    { terms: ['todo', 'fixme', 'hack', 'xxx', 'temp'], location: 'start' },
  ],

  // 🧹 No useless code
  'no-useless-return': 'error',
  'no-useless-concat': 'error',
  'no-useless-escape': 'warn',
};

export default [
  // Base config — all .js files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: AI_SLOP_RULES,
  },

  // CommonJS backend files
  {
    files: ['server.js', 'babel.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },

  // ES module game logic files (no Node globals needed — browser context for game.js)
  {
    files: ['game.js', 'en.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },

  // Test files
  {
    files: ['game.test.js'],
    languageOptions: {
      sourceType: 'module',
      globals: globals.jest,
    },
    rules: {
      'max-lines-per-function': ['warn', 80],
    },
  },

  // Ignores
  {
    ignores: ['node_modules/**', 'data/**', 'coverage/**', 'test-slop.js'],
  },
];
