// Run system tests against the dev project
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!serviceAccount) {
  console.error(
    "Specify the path to the service account in GOOGLE_APPLICATION_CREDENTIALS"
  )
  process.exit(1)
}

const testUserPassword = process.env.SYSTEM_TEST_USER_PASSWORD
if (!testUserPassword) {
  console.error(
    "Specify the password for systemtestuser@example.com in SYSTEM_TEST_USER_PASSWORD"
  )
  process.exit(1)
}

Object.assign(process.env, {
  NEXT_PUBLIC_PROJECT_ID: "digital-testimony-dev",
  GOOGLE_APPLICATION_CREDENTIALS: serviceAccount,
  SYSTEM_TEST_USER_PASSWORD: testUserPassword
})

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  clearMocks: true,
  roots: ["tests/system"],
  testEnvironment: "node"
}

// See https://nextjs.org/docs/advanced-features/compiler#jest
const nextJest = require("next/jest")
const createJestConfig = nextJest()
module.exports = createJestConfig(config)
