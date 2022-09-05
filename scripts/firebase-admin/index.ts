import repl from "repl"
import { Array, Literal as L, Optional, Record, String, Union } from "runtypes"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { runAgainstEmulators, runAgainstProject } from "../configure"
import { Context, Script, ScriptContext } from "./types"

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
      const { script: scriptName } = ScriptArgs.check(args)
      const context: ScriptContext = { ...init(args), args: args as any }
      const script: Script = require(`./${scriptName}`).script

      await script(context)
    }
  )
  .strictCommands()
  .options({
    env: { choices: ["local", "dev", "prod"], alias: "e" }
  }).argv
