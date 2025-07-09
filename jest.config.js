const nextJest = require("next/jest")

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./"
})

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^components/(.*)$": "<rootDir>/components/$1",
    // This maps firebase-admin/auth to the correct location within node_modules
    "^firebase-admin/auth$": "<rootDir>/node_modules/firebase-admin/lib/auth/index.js",
    "^firebase-admin/app$": "<rootDir>/node_modules/firebase-admin/lib/app/index.js",
    "^firebase-admin/(.*)$": "<rootDir>/node_modules/firebase-admin/lib/$1",
  }
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config)
