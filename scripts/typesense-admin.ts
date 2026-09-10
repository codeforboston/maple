import repl from "repl"
import yargs, { Arguments } from "yargs"
import { hideBin } from "yargs/helpers"
import { createClient } from "../functions/src/search/client"
import {
  SYNONYM_SET_NAME,
  upsertLegislativeSynonyms
} from "../functions/src/search/synonyms"
import { aliases, evalCollections } from "./search-eval/collections"
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
      // The catch is attached immediately: a fast rejection (a pre-cutover
      // 0.24 gateway with no /synonym_sets route, an unreachable host) would
      // otherwise crash the process as an unhandled rejection before any of
      // the output below prints.
      const synonymSetsPromise: Promise<unknown> = client
        .synonymSets()
        .retrieve()
        .catch((e: unknown) => e)

      const { version } = await client.debug.retrieve()
      console.log(`server:  ${version}`)

      const { aliases } = await client.aliases().retrieve()
      const live = new Set(aliases.map(a => a.collection_name))

      // One listing serves both the alias rows and the orphan check, instead
      // of a round trip per alias plus the listing.
      const collections = await client.collections().retrieve()
      const documentCounts = new Map(
        collections.map(c => [c.name, c.num_documents])
      )

      if (aliases.length === 0) {
        console.log("aliases: none — nothing is being served")
      }
      for (const { name, collection_name } of aliases) {
        console.log(
          `${name} -> ${collection_name}  ${
            documentCounts.get(collection_name) ?? "?"
          } docs`
        )
      }

      /** A collection with no alias pointing at it is a backfill that never
       * reached `upgradeAlias` — a run that failed, or one superseded by a
       * later deploy before it finished. The backfill resumes from its cursor
       * rather than from the first batch, so an orphan that is still growing is
       * a run in progress; one that is not is wreckage. `yarn firebase-admin
       * run-script searchUpgradeStatus` says which, and why.
       */
      const orphans = collections.filter(c => !live.has(c.name))
      for (const { name, num_documents } of orphans) {
        console.log(`(orphan) ${name}  ${num_documents} docs`)
      }

      /** Server state the searches reference by name; a missing set means
       * every `synonym_sets` search runs with synonyms silently off. */
      const synonymSets = await synonymSetsPromise
      if (!Array.isArray(synonymSets)) {
        console.log(`synonym sets unavailable: ${synonymSets}`)
        return
      }
      for (const { name, items } of synonymSets) {
        console.log(`synonyms ${name}  ${items.length} items`)
      }
      if (!synonymSets.some(s => s.name === SYNONYM_SET_NAME)) {
        console.log(`(missing) synonym set "${SYNONYM_SET_NAME}"`)
      }
    }
  )
  .command(
    "preview-eval-corpus [alias]",
    "point the local app alias(es) at their _eval collection, so `yarn dev:up`'s running app shows the frozen search-eval corpus instead of the dev-workflow backfill (run `yarn search-eval seed -e local` first). Kept separate from `search-eval seed` so eval runs never touch app aliases as a side effect.",
    yargs =>
      yargs.positional("alias", {
        string: true,
        choices: aliases,
        describe: "restrict to one alias; defaults to every eval collection"
      }),
    async (args: Args & { alias?: string }) => {
      const client = resolveClient(args)
      const targets = args.alias
        ? [evalCollections[args.alias]]
        : Object.values(evalCollections)
      for (const { alias, evalCollection } of targets) {
        const exists = await client.collections(evalCollection).exists()
        if (!exists) {
          throw Error(
            `"${evalCollection}" doesn't exist yet — run: yarn search-eval seed -e local --alias ${alias}`
          )
        }
        await client
          .aliases()
          .upsert(alias, { collection_name: evalCollection })
        console.log(`${alias} -> ${evalCollection}`)
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
