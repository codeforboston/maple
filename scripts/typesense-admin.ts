import { execSync } from "child_process"
import repl from "repl"
import { Client } from "typesense"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { createClient } from "../functions/src/search/client"

declare global {
  var client: Client
}

const envs: Record<string, { url: string; key?: string; alias?: string }> = {
  local: { url: "http://localhost:8108", key: "test-api-key" },
  dev: { url: "https://maple.aballslab.com/search", alias: "default" }
}

type Args = { url?: string; key?: string; env?: string }
yargs(hideBin(process.argv))
  .scriptName("typesense-admin")
  .command(
    "console",
    "start a node repl with an initialized client",
    () => {},
    (args: Args) => {
      globalThis.client = resolveClient(args)
      repl.start({}).setupHistory("typesense-admin.history", () => {})
    }
  )
  .command(
    "create-search-key",
    "create a new search key",
    () => {},
    async (args: Args) => {
      const client = resolveClient(args)
      const key = await client.keys().create({
        description: "Search-only key.",
        actions: ["documents:search"],
        collections: ["*"]
      })
      console.log("Created", key.value)
    }
  )
  .command(
    "list-keys",
    "list keys",
    () => {},
    async (args: Args) => {
      const client = resolveClient(args)
      console.log(await client.keys().retrieve())
    }
  )
  .command(
    "delete-key <id>",
    "list keys",
    () => {},
    async (args: Args & { id: string }) => {
      const client = resolveClient(args)
      console.log(await client.keys(Number(args.id)).delete())
    }
  )
  .options({
    url: { string: true, alias: "u" },
    key: { string: true, alias: "k" },
    env: { choices: Object.keys(envs), alias: "e" }
  })
  .check(argv => {
    if (!argv.env && !argv.url) return "Must specify env or url"
    if (!argv.env && !argv.key) return "Must specify env or key"
    return true
  })
  .strictCommands().argv

function resolveClient(args: Args) {
  let key: string | undefined, url: string | undefined
  if (args.env) {
    const env = envs[args.env]
    if (!env) throw Error(`Invalid env, allowed values: ${Object.keys(envs)}`)
    url = env.url
    if (env.key) {
      key = env.key
    } else if (env.alias) {
      key = execSync(
        `yarn -s firebase --project ${env.alias} functions:secrets:access TYPESENSE_API_KEY`
      )
        .toString()
        .trim()
    } else {
      throw Error("Couldn't resolve env")
    }
  }
  if (args.url) url = args.url
  if (args.key) key = args.key

  if (!url || !key) throw new Error("Couldn't resolve url or key")

  return createClient(url, key)
}
