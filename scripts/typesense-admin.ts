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
  .command(
    "status",
    "print the server version, every alias with its live collection and document count, and any orphaned collections",
    {},
    async (args: Args) => {
      const client = resolveClient(args)

      const { version } = await client.debug.retrieve()
      console.log(`server:  ${version}`)

      const { aliases } = await client.aliases().retrieve()
      const live = new Set(aliases.map(a => a.collection_name))

      if (aliases.length === 0) {
        console.log("aliases: none — nothing is being served")
      }
      for (const { name, collection_name } of aliases) {
        const { num_documents } = await client
          .collections(collection_name)
          .retrieve()
        console.log(`${name} -> ${collection_name}  ${num_documents} docs`)
      }

      /** A collection with no alias pointing at it is a backfill that never
       * reached `upgradeAlias` — a run that failed, or one superseded by a
       * later deploy before it finished. The backfill resumes from its cursor
       * rather than from the first batch, so an orphan that is still growing is
       * a run in progress; one that is not is wreckage. `yarn firebase-admin
       * run-script searchUpgradeStatus` says which, and why.
       */
      const orphans = (await client.collections().retrieve()).filter(
        c => !live.has(c.name)
      )
      for (const { name, num_documents } of orphans) {
        console.log(`(orphan) ${name}  ${num_documents} docs`)
      }
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
