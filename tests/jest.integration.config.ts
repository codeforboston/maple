import { Config } from "@jest/types"
import nextJest from "next/jest"
import { runAgainstEmulators } from "../scripts/configure"

runAgainstEmulators()

const config: Config.InitialOptions = {
  clearMocks: true,
  testEnvironment: "./tests/integrationEnvironment.ts",
  rootDir: "..",
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/tests/system",
    "<rootDir>/tests/seed",
    "<rootDir>/functions"
  ],
  moduleNameMapper: {
    // This maps firebase-admin/auth to the correct location within node_modules
    "^firebase-admin/auth$":
      "<rootDir>/node_modules/firebase-admin/lib/auth/index.js",
    "^firebase-admin/app$":
      "<rootDir>/node_modules/firebase-admin/lib/app/index.js",
    "^firebase-admin/(.*)$": "<rootDir>/node_modules/firebase-admin/lib/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.integration.ts"],
  modulePaths: ["<rootDir>"],
  reporters: ["default", ["jest-summary-reporter", { failuresOnly: false }]]
}

// See https://nextjs.org/docs/advanced-features/compiler#jest
export default nextJest()(config)
