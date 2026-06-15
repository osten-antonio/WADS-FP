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
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
    // Transform the ESM-only markdown ecosystem (plain .js/.mjs) to CommonJS.
    // configFile/babelrc false keeps this isolated so Next.js keeps using SWC.
    "^.+\\.(js|mjs|cjs)$": [
      "babel-jest",
      {
        configFile: false,
        babelrc: false,
        presets: [["@babel/preset-env", { targets: { node: "current" } }]],
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(" +
      [
        "unified", "bail", "is-plain-obj", "trough", "devlop",
        "vfile", "vfile-message",
        "unist-util-.*", "mdast-util-.*", "micromark", "micromark-.*",
        "decode-named-character-reference", "character-entities.*",
        "property-information", "hast-util-.*", "hastscript",
        "html-void-elements", "web-namespaces", "zwitch",
        "comma-separated-tokens", "space-separated-tokens",
        "remark-.*", "rehype-.*", "trim-lines", "ccount",
        "escape-string-regexp", "markdown-table", "longest-streak",
        "stringify-entities", "parse-entities", "estree-util-.*",
      ].join("|") +
      ")/)",
  ],
}
