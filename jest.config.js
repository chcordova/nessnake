export default {
  preset: "ts-jest/presets/default",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/tests/**/*.test.ts"],
  testPathIgnorePatterns: ["tests/e2e/"],
};
