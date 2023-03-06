/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  testMatch: ["<rootDir>/src/tests/**/*.test.ts"],

  globals: {
    "ts-jest": { tsconfig: "<rootDir>/tsconfig.json" },
  },
};
