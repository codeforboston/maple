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
  // transformIgnorePatterns: [],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.integration.ts"],
  modulePaths: ["<rootDir>"],
  reporters: ["jest-silent-reporter", "summary"]
  // reporters: [["default", { summaryThreshold: 1 }]]
}

const modulesToTransform = ["@firebase", "firebase", "nanoid"]

// See https://nextjs.org/docs/advanced-features/compiler#jest
const cfg = async () => {
  const res = await nextJest()(config)()

  res.transformIgnorePatterns = res.transformIgnorePatterns.filter(
    (p: any) => !p.includes("node_modules")
  )
  res.transformIgnorePatterns.push(
    `/node_modules/(?!(${modulesToTransform.join("|")})/)`
  )

  console.log(res)
  return res
}

export default cfg
