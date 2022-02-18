// Run tests against the emulators
Object.assign(process.env, {
  NEXT_PUBLIC_PROJECT_ID: "demo-dtp",
  GCLOUD_PROJECT: "demo-dtp",
  NEXT_PUBLIC_USE_EMULATOR: "true",
  FIRESTORE_EMULATOR_HOST: "localhost:8080",
  FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099"
})

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  clearMocks: true,
  roots: ["integrationTests"],
  testEnvironment: "node"
}

// See https://nextjs.org/docs/advanced-features/compiler#jest
const nextJest = require("next/jest")
const createJestConfig = nextJest()
module.exports = createJestConfig(config)
