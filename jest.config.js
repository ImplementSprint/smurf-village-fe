const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx}", "<rootDir>/tests/unit/**/*.spec.{ts,tsx}"],
  collectCoverageFrom: [
    "src/lib/api.ts",
    "src/lib/authStorage.ts",
    "src/lib/roleMap.ts",
    "src/lib/sum.ts",
    "src/lib/timekeepingUtils.ts",
    "src/components/onboarding/shared/utils.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

module.exports = createJestConfig(config);
