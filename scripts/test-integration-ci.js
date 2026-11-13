const { readFileSync } = require("fs")
const { demoProjectId, env, runOrExit } = require("./common")

// The functions sync every testimony and bill write to Typesense, as CI's
// typesense service provides. Without it each sync throws, the emulator kills
// that function's worker, and the next event waits on a fresh one: the backlog
// starves triggers the tests wait on, such as the cosign tally.
async function requireSearch() {
  const url = readFileSync(`functions/.env.${demoProjectId}`, "utf8").match(
    /^TYPESENSE_API_URL=(.*)$/m
  )[1]
  try {
    if ((await fetch(`${url}/health`)).ok) return
  } catch {}
  console.error(
    `Integration tests need Typesense at ${url}, as CI runs it.\n` +
      "Start it with: docker compose -f infra/docker-compose.yml up -d search"
  )
  process.exit(1)
}

requireSearch().then(() => {
  runOrExit("yarn", ["--cwd", "functions", "build"], { stdio: "inherit" })
  runOrExit(
    "./node_modules/.bin/firebase",
    [
      "--project",
      demoProjectId,
      "emulators:exec",
      "--only",
      "auth,functions,pubsub,firestore,storage",
      "--import",
      "tests/integration/exportedTestData",
      `yarn test:integration --forceExit ${process.argv.slice(2).join(" ")}`
    ],
    { stdio: "inherit", env }
  )
})
