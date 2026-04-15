const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx}", "<rootDir>/tests/unit/**/*.spec.{ts,tsx}"],
  coverageReporters: ["json-summary", "lcov", "text"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
    "!src/app/**/layout.tsx",
    "!src/app/**/page.tsx",
    "!src/app/globals.css",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

module.exports = createJestConfig(config);
