import { Config } from "@jest/types"
import nextJest from "next/jest"
import { runAgainstDevProject } from "./configure"

runAgainstDevProject()

const config: Config.InitialOptions = {
  clearMocks: true,
  rootDir: "..",
  roots: ["tests/system"],
  testEnvironment: "./tests/integrationEnvironment.ts"
}

// See https://nextjs.org/docs/advanced-features/compiler#jest
module.exports = nextJest()(config)
