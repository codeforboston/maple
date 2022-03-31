import { runAgainstEmulators } from "./configure"
import { Config } from "@jest/types"
import nextJest from "next/jest"

runAgainstEmulators()

const config: Config.InitialOptions = {
  clearMocks: true,
  testEnvironment: "./tests/integrationEnvironment.ts",
  rootDir: "..",
  roots: ["tests/seed"]
}

// See https://nextjs.org/docs/advanced-features/compiler#jest
export default nextJest()(config)
