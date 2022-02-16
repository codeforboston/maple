const concurrently = require("concurrently")

const demoProjectId = "demo-dtp"
const env = {
  ...process.env,
  NEXT_PUBLIC_USE_EMULATOR: true,
  NEXT_PUBLIC_PROJECT_ID: demoProjectId
}

const emulatorsStartArgs = process.argv.slice(2).join(" ")

concurrently([
  {
    command: "yarn:build:watch",
    name: "functions",
    prefixColor: "magenta",
    cwd: "functions",
    env
  },
  {
    command: "yarn:dev",
    name: "next.js",
    prefixColor: "green",
    env
  },
  {
    command: `firebase --project ${demoProjectId} emulators:start --only auth,functions,pubsub,firestore ${emulatorsStartArgs}`,
    name: "emulators",
    prefixColor: "blue",
    env
  }
])
