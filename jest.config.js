/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  modulePaths: ["<rootDir>/app/"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/app/$1",
  },
  preset: "ts-jest",
  testEnvironment: "node",
};
