/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",

  globals: {
    "ts-jest": { tsconfig: "tsconfig.json" },
  },
};
