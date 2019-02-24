const path = require('path');

module.exports = {
  preset: "ts-jest",
  rootDir: path.resolve(__dirname, "./"),
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  testEnvironment: 'jsdom',
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js|jsx)$",
  transform: {
    "^.+\\.tsx?$": "<rootDir>/node_modules/ts-jest",
  },
  coverageDirectory: "<rootDir>/tests/coverage",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/test/"
  ],
};
