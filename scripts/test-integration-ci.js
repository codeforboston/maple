const { demoProjectId, env, runOrExit } = require("./common")

runOrExit("yarn", ["--cwd", "functions", "build"], { stdio: "inherit" })
runOrExit(
  "firebase",
  [
    "--project",
    demoProjectId,
    "emulators:exec",
    "--only",
    "auth,functions,pubsub,firestore,storage",
    "--import",
    "tests/integration/exportedTestData",
    "yarn test:integration --forceExit"
  ],
  { stdio: "inherit", env }
)
