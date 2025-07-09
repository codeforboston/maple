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
  setupFilesAfterEnv: ["<rootDir>/tests/setup.integration.ts"],
  modulePaths: ["<rootDir>"],
  reporters: ["default", ["jest-summary-reporter", { failuresOnly: false }]]
}

// See https://nextjs.org/docs/advanced-features/compiler#jest
export default nextJest()(config)
