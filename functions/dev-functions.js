const { spawn } = require("child_process")

const demoProjectId = "demo-dtp"

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

    child.stdout.pipe(process.stdout)
    child.stdout.on("data", data => {
      if (data.toString().includes("Watching for file changes.")) {
        child.stdout.unpipe()
        child.stdout.removeAllListeners("data")
        res(child)
      }
    })
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
        "pubsub,firestore"
      ],
      { stdio: ["ignore", "pipe", "inherit"] }
    )

    const safeWord = "All emulators ready! It is now safe to connect your app."
    child.stdout.pipe(process.stdout)
    child.stdout.on("data", data => {
      if (data.toString().includes(safeWord)) {
        child.stdout.unpipe()
        child.stdout.removeAllListeners("data")
        res(child)
      }
    })
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
