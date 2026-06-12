/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {},
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: [
    'lib/**/*.js',
    'automation/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  forceExit: true,
};

module.exports = config;
