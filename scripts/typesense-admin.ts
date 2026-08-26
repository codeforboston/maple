import repl from "repl"
import yargs, { Arguments } from "yargs"
import { hideBin } from "yargs/helpers"
import { createClient } from "../functions/src/search/client"
import {
  SYNONYM_SET_NAME,
  upsertLegislativeSynonyms
} from "../functions/src/search/synonyms"
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
      // Independent of the alias walk below; starts now, printed at the end.
      const synonymSetsPromise = client.synonymSets().retrieve()

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

      /** Server state the searches reference by name; a missing set means
       * every `synonym_sets` search runs with synonyms silently off. */
      const synonymSets = await synonymSetsPromise
      for (const { name, items } of synonymSets) {
        console.log(`synonyms ${name}  ${items.length} items`)
      }
      if (!synonymSets.some(s => s.name === SYNONYM_SET_NAME)) {
        console.log(`(missing) synonym set "${SYNONYM_SET_NAME}"`)
      }
    }
  )
  .command("list-keys", "list keys", {}, async (args: Args) => {
    const client = resolveClient(args)
    console.log(await client.keys().retrieve())
  })
  .command(
    "upsert-synonyms",
    "upsert the legislative synonym set from functions/src/search/synonyms.ts (deploys also do this, via checkSearchIndexVersion)",
    {},
    async (args: Args) => {
      const client = resolveClient(args)
      const { name, items } = await upsertLegislativeSynonyms(client)
      console.log(`Upserted synonym set "${name}" with ${items} items`)
    }
  )
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
