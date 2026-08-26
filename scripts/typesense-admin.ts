import repl from "repl"
import yargs, { Arguments } from "yargs"
import { hideBin } from "yargs/helpers"
import { createClient } from "../functions/src/search/client"
import {
  TypesenseConnectionArgs,
  resolveClient,
  typesenseEnvs
} from "./typesense-env"

declare global {
  var client: ReturnType<typeof createClient>
}

type Args = Arguments<TypesenseConnectionArgs>
yargs(hideBin(process.argv))
  .scriptName("typesense-admin")
  .command(
    "console",
    "start a node repl with an initialized client",
    {},
    (args: Args) => {
      globalThis.client = resolveClient(args)
      repl.start({}).setupHistory("typesense-admin.history", () => {})
    }
  )
  .command(
    "create-search-key",
    "create a new search key",
    {},
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
  .command("list-keys", "list keys", {}, async (args: Args) => {
    const client = resolveClient(args)
    console.log(await client.keys().retrieve())
  })
  .command(
    "delete-key <id>",
    "list keys",
    {},
    async (args: Args & { id?: string }) => {
      const client = resolveClient(args)
      console.log(await client.keys(Number(args.id)).delete())
    }
  )
  .options({
    url: { string: true, alias: "u" },
    key: { string: true, alias: "k" },
    env: { choices: Object.keys(typesenseEnvs), alias: "e" }
  })
  .check(argv => {
    if (!argv.env && !argv.url) return "Must specify env or url"
    if (!argv.env && !argv.key) return "Must specify env or key"
    return true
  })
  .strictCommands().argv
