const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/lib/sum.ts',
    '<rootDir>/src/lib/roleMap.ts',
    '<rootDir>/src/lib/timekeepingUtils.ts',
    '<rootDir>/src/lib/timeAgo.ts',
    '<rootDir>/src/lib/useCloseOnOutsideClick.ts',
    '<rootDir>/src/lib/employeeTypes.ts',
    '<rootDir>/src/lib/timekeepingHelpers.ts',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
