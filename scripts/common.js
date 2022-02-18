const { spawnSync } = require("child_process")

const demoProjectId = "demo-dtp"
const env = {
  ...process.env,
  NEXT_PUBLIC_USE_EMULATOR: true,
  NEXT_PUBLIC_PROJECT_ID: demoProjectId
}

function runOrExit(...args) {
  const { status } = spawnSync(...args)
  if (status !== 0) process.exit(status ?? 1)
}

module.exports = {
  demoProjectId,
  env,
  runOrExit
}
