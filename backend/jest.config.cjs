module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};