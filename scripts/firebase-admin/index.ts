import repl from "repl"
import { Array, Literal as L, Optional, Record, String, Union } from "runtypes"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { runAgainstEmulators, runAgainstProject } from "../configure"
import { Context, Script, ScriptContext } from "./types"
import { listAllUsers } from "./list-all-users"
import { ArgsError } from "./args"

const Args = Record({
  env: Union(L("local"), L("dev"), L("prod")),
  creds: Optional(String)
})

const ScriptArgs = Args.extend({ script: String, argv: Array(String) })

const init: (args: unknown) => Context = args => {
  const { env, creds } = Args.check(args)
  if (creds) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = creds
  }
  switch (env) {
    case "dev":
      runAgainstProject("digital-testimony-dev")
      break
    case "prod":
      runAgainstProject("digital-testimony-prod")
      break
    case "local":
      runAgainstEmulators()
      break
  }
  const firebase = require("../../functions/src/firebase")
  const api = require("../../functions/src/malegislature")
  return {
    env,
    firebase,
    auth: firebase.auth,
    db: firebase.db,
    admin: firebase.admin,
    api
  }
}

yargs(hideBin(process.argv))
  .scriptName("firebase-admin")
  .command(
    "console",
    "start a node repl with an initialized admin and db",
    () => {},
    (args: unknown) => {
      const context = init(args)
      Object.assign(globalThis, context)
      repl.start({}).setupHistory("firebase-admin.history", () => {})
    }
  )
  .command(
    "run-script <script> [argv...]",
    "run a script in an initialized environment",
    yargs =>
      yargs.options({
        creds: {
          string: true,
          describe: "path to google application credentials file",
          alias: "c"
        }
      }),
    async (args: unknown) => {
      // A space in a list (--courts 192, 193) leaves 193 as a stray positional
      // that yargs parses as a number
      const stray = ((args as { argv?: unknown[] }).argv ?? []).filter(
        a => typeof a !== "string"
      )
      if (stray.length) {
        console.error(
          `Unexpected argument(s): ${stray.join(", ")}\n` +
            `Comma-separated lists can't contain spaces, e.g. --courts 192,193 ` +
            `(or quote them: --courts "192, 193")`
        )
        process.exitCode = 1
        return
      }

      const { script: scriptName } = ScriptArgs.check(args)
      const context: ScriptContext = { ...init(args), args: args as any }
      const script: Script = require(`./${scriptName}`).script

      try {
        await script(context)
      } catch (err) {
        if (!(err instanceof ArgsError)) throw err
        console.error(err.message)
        process.exitCode = 1
      }
    }
  )
  .strictCommands()
  .options({
    env: { choices: ["local", "dev", "prod"], alias: "e" }
  }).argv
