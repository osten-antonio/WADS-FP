/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coveragePathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/components/ui/",
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
    "^@/(.*)$": "<rootDir>/$1",
  },
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
}