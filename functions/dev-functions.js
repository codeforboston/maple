const { spawn } = require("child_process")

const demoProjectId = "demo-dtp"
const emulatorArgs = process.argv.slice(2)

run()

/** Start the build, then the emulators, and then the shell, waiting for each to
 * initialize. */
async function run() {
  const build = await startBuild()
  const emulators = await startEmulators()
  await startShell(build, emulators)
}

function startBuild() {
  return new Promise(res => {
    const child = spawn("tsc", ["--watch", "--preserveWatchOutput"], {
      stdio: ["ignore", "pipe", "inherit"]
    })

    const safeWord = "Found 0 errors. Watching for file changes."
    const listener = data => {
      if (data.toString().includes(safeWord)) {
        child.stdout.removeListener("data", listener)
        res(child)
      }
    }
    child.stdout.pipe(process.stdout)
    child.stdout.on("data", listener)
  })
}

function startEmulators() {
  return new Promise(res => {
    const child = spawn(
      "firebase",
      [
        "--project",
        demoProjectId,
        "emulators:start",
        "--only",
        "pubsub,firestore,storage",
        ...emulatorArgs
      ],
      { stdio: ["ignore", "pipe", "inherit"] }
    )

    const safeWord = "All emulators ready! It is now safe to connect your app."
    const listener = data => {
      if (data.toString().includes(safeWord)) {
        child.stdout.unpipe()
        child.stdout.removeAllListeners("data")
        res(child)
      }
    }
    child.stdout.pipe(process.stdout)
    child.stdout.on("data", listener)
  })
}

function startShell(build, emulators) {
  return new Promise(res => {
    const shell = spawn(
      "firebase",
      ["--project", demoProjectId, "functions:shell"],
      { stdio: "inherit" }
    )

    shell.on("exit", () => {
      build.kill("SIGINT")
      emulators.kill("SIGINT")
      res()
    })
  })
}
