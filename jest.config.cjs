/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/routeTree.gen.ts",
    "!src/vite-env.d.ts",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "<rootDir>/src/test-utils/style-mock.cjs",
    "\\.(gif|png|jpg|jpeg|svg|webp|avif)$": "<rootDir>/src/test-utils/file-mock.cjs",
  },
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.jest.ts"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
        module: {
          type: "commonjs",
        },
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@tanstack|lucide-react|framer-motion|react-markdown|remark-gfm|vfile|unist-util-.*|mdast-util-.*|micromark.*)/)",
  ],
};
