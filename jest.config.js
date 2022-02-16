// Run tests against the emulators
process.env.NEXT_PUBLIC_PROJECT_ID = "demo-dtp"
process.env.NEXT_PUBLIC_USE_EMULATOR = "true"

// See https://nextjs.org/docs/advanced-features/compiler#jest
const nextJest = require("next/jest")

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest()

// Any custom config you want to pass to Jest
const config = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // A list of paths to directories that Jest should use to search for files in
  roots: ["pages", "components", "tests"],

  // The test environment that will be used for testing
  testEnvironment: "jsdom"
}

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(config)
