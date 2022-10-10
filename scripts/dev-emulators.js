const concurrently = require("concurrently")
const { demoProjectId, env } = require("./common")

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
    command: `firebase --project ${demoProjectId} emulators:start --only auth,functions,pubsub,firestore,storage ${emulatorsStartArgs}`,
    name: "emulators",
    prefixColor: "blue",
    env
  }
])
