import { execSync } from "child_process"
import { writeFileSync } from "fs"
import { join } from "path"
import type { SearchParams } from "typesense"
import yargs, { Arguments } from "yargs"
import { hideBin } from "yargs/helpers"
import { TypesenseConnectionArgs, resolveClient } from "../typesense-env"
import { EvalCollection, aliases, resolveEvalCollection } from "./collections"
import {
  CorpusDoc,
  corpusDir,
  majorityCourt,
  readCorpus,
  readMeta,
  seedCollection
} from "./corpus"
import {
  GoldenQuery,
  GoldenSet,
  labels,
  loadGoldens,
  resolveJudgments,
  resolveRuleViaSearch
} from "./goldens"
import { Judgments, computeMetrics } from "./metrics"
import {
  QueryResult,
  buildResults,
  compare,
  printScorecard,
  writeResults
} from "./report"

type Args = Arguments<
  TypesenseConnectionArgs & {
    alias?: string
    collection?: string
    out?: string
    courtFilter?: boolean
    only?: string
    threshold?: number
    limit?: number
    orderBy?: string
  }
>

const resolveTarget = (args: Args) => {
  const evalCollection = resolveEvalCollection(args.alias ?? "bills")
  const collection =
    args.collection ??
    (args.env === "local"
      ? evalCollection.evalCollection
      : evalCollection.alias)
  return { evalCollection, collection }
}

/** The typesense client's own search params, with the fields every eval
 * search must pin made required. New ranking knobs added to
 * components/search/searchParams.ts flow through without edits here.
 */
type EvalSearchParams = SearchParams<CorpusDoc> & {
  q: string
  query_by: string
  per_page: number
}

function createSearcher(
  args: Args,
  evalCollection: EvalCollection,
  collection: string
) {
  const client = resolveClient(args)
  return {
    client,
    search: async (params: EvalSearchParams): Promise<CorpusDoc[]> => {
      const result = await client
        .collections<CorpusDoc>(collection)
        .documents()
        .search({ include_fields: evalCollection.includeFields, ...params })
      return (result.hits ?? []).map(h => h.document)
    }
  }
}

/** The court filter applied to a query, mirroring the app's court refinement. */
function courtFor(
  query: GoldenQuery,
  goldens: GoldenSet,
  args: Args,
  majority: number
): number | undefined {
  const enabled =
    args.courtFilter !== false &&
    (query.courtFilter ?? goldens.defaults.courtFilter)
  return enabled ? majority : undefined
}

/** The ranking params under test: everything the app sends except
 * exclude_fields, which conflicts with the eval's pinned include_fields. The
 * cast re-homes the adapter's parameter type, which is generic over its own
 * DocumentSchema, onto the CorpusDoc the eval pins.
 */
const rankingParams = ({ searchParams }: EvalCollection) => {
  const { exclude_fields: _, ...rest } = searchParams
  return rest as Omit<SearchParams<CorpusDoc>, "q" | "per_page"> & {
    query_by: string
  }
}

const searchTop10 = (
  search: ReturnType<typeof createSearcher>["search"],
  evalCollection: EvalCollection,
  query: GoldenQuery,
  goldens: GoldenSet,
  court: number | undefined
) =>
  search({
    ...rankingParams(evalCollection),
    q: query.query,
    sort_by: goldens.defaults.sort_by,
    filter_by: court === undefined ? undefined : `court:=${court}`,
    per_page: 10
  })

async function judgmentsFor(
  query: GoldenQuery,
  goldens: GoldenSet,
  args: Args,
  court: number | undefined,
  search: ReturnType<typeof createSearcher>["search"],
  localDocs: CorpusDoc[] | undefined
): Promise<Judgments | undefined> {
  if (localDocs) return resolveJudgments(query, goldens, localDocs, court)

  // Live (dev/prod) target: the local corpus is not authoritative there, so
  // explicit labels pass through and rules resolve by searching the live index.
  const judgments: Judgments = new Map()
  for (const entry of labels(query, goldens)) {
    if (entry.docId) {
      judgments.set(entry.docId, entry.grade)
    } else if (entry.rule) {
      const resolved = await resolveRuleViaSearch(entry.rule, entry.grade, p =>
        search({
          ...p,
          filter_by: court === undefined ? undefined : `court:=${court}`
        })
      )
      resolved.forEach((grade, id) =>
        judgments.set(id, Math.max(judgments.get(id) ?? 0, grade))
      )
    }
  }
  return judgments.size ? judgments : undefined
}

async function runEval(args: Args) {
  const { evalCollection, collection } = resolveTarget(args)
  const goldens = loadGoldens(evalCollection.alias)
  const { client, search } = createSearcher(args, evalCollection, collection)
  const localDocs =
    args.env === "local" ? readCorpus(evalCollection.alias).docs : undefined
  const meta = readMeta(evalCollection.alias)
  const majority = majorityCourt(meta)

  const results: QueryResult[] = []
  const skipped: string[] = []
  for (const query of goldens.queries) {
    const court = courtFor(query, goldens, args, majority)
    const judgments = await judgmentsFor(
      query,
      goldens,
      args,
      court,
      search,
      localDocs
    )
    if (!judgments || judgments.size === 0) {
      skipped.push(query.id)
      continue
    }

    const top10 = await searchTop10(
      search,
      evalCollection,
      query,
      goldens,
      court
    )
    const topIds = top10.map(d => d.id)
    results.push({
      id: query.id,
      category: query.category,
      query: query.query,
      metrics: computeMetrics(topIds, judgments),
      top10: topIds,
      relevantCount: judgments.size
    })
  }

  const serverVersion = await client.debug
    .retrieve()
    .then((d: { version?: string }) => d.version ?? "unknown")
    .catch(() => "unknown")
  const gitSha = execSync("git rev-parse HEAD").toString().trim()

  const evalResults = buildResults(
    {
      env: args.env ?? "custom",
      url: args.url ?? "",
      alias: evalCollection.alias,
      collection,
      serverVersion,
      corpusMd5: meta.jsonlMd5,
      gitSha,
      timestamp: new Date().toISOString(),
      sortBy: goldens.defaults.sort_by,
      court:
        args.courtFilter === false || !goldens.defaults.courtFilter
          ? undefined
          : majority,
      skippedQueries: skipped
    },
    results
  )
  printScorecard(evalResults)
  if (args.out) writeResults(evalResults, args.out)
}

/** Renders one field of a hit for the labeling sheet: arrays joined, pipes
 * swapped out so they cannot break the markdown table.
 */
const cell = (value: unknown) =>
  (Array.isArray(value) ? value.join("; ") : (value ?? "").toString()).replace(
    /\|/g,
    "/"
  )

async function writeLabelingSheet(args: Args) {
  const { evalCollection, collection } = resolveTarget(args)
  const goldens = loadGoldens(evalCollection.alias)
  const { search } = createSearcher(args, evalCollection, collection)
  const queries = goldens.queries.filter(
    q => !args.only || q.category === args.only
  )

  // The pinned include_fields minus the id, which gets its own column.
  const columns = evalCollection.includeFields
    .split(",")
    .filter(field => field !== "id")

  const sections: string[] = [
    `# Search eval labeling sheet — ${evalCollection.alias}`,
    "",
    `Top 10 results per golden query (collection "${collection}", sort "${goldens.defaults.sort_by}").`,
    "Grade each result: 3 = exactly what the searcher wanted, 1 = relevant, 0/blank = not relevant.",
    `Merge grades into tests/search-eval/goldens/${evalCollection.alias}.json as explicit docId entries.`,
    ""
  ]
  const majority = majorityCourt(readMeta(evalCollection.alias))
  for (const query of queries) {
    const court = courtFor(query, goldens, args, majority)
    const top10 = await searchTop10(
      search,
      evalCollection,
      query,
      goldens,
      court
    )
    sections.push(
      `## ${query.id} (${query.category}): "${query.query}"`,
      "",
      `| grade | rank | docId | ${columns.join(" | ")} |`,
      `| --- | --- | --- | ${columns.map(() => "---").join(" | ")} |`,
      ...top10.map(
        (d, i) =>
          `|  | ${i + 1} | ${d.id} | ${columns
            .map(field => cell(d[field]))
            .join(" | ")} |`
      ),
      ""
    )
  }

  const path = join(
    __dirname,
    `../../tests/search-eval/labeling-sheet-${evalCollection.alias}.md`
  )
  writeFileSync(path, sections.join("\n"))
  console.log(`Wrote labeling sheet for ${queries.length} queries to ${path}`)
}

/** Builds a corpus from a live project. Imports are deferred because pulling in
 * the search configs loads firebase-admin, which every other subcommand does
 * without.
 */
async function buildRemoteCorpus(args: Args) {
  const env = args.env
  if (env !== "dev" && env !== "prod")
    throw Error(
      "corpus needs --env dev or --env prod. The bills corpus comes from the committed emulator fixture: yarn search-eval:corpus"
    )

  const { evalCollection } = resolveTarget(args)
  // require, not import(): under ts-node --swc the dynamic import survives as a
  // native ESM import and fails to resolve the extensionless path.
  const { fetchRemoteDocs, projects } =
    require("./remoteCorpus") as typeof import("./remoteCorpus")
  const { writeCorpus } =
    require("./corpusFiles") as typeof import("./corpusFiles")
  const { getRegisteredConfigs } =
    require("../../functions/src/search/config") as typeof import("../../functions/src/search/config")
  require("../../functions/src/hearings/search")
  require("../../functions/src/testimony/search")

  const config = getRegisteredConfigs().find(
    c => c.alias === evalCollection.alias
  )
  if (!config)
    throw Error(`No search config registered for "${evalCollection.alias}"`)

  const [orderByField, direction = "asc"] = (
    args.orderBy ?? config.idField
  ).split(":")
  if (direction !== "asc" && direction !== "desc")
    throw Error(`--order-by direction must be asc or desc, got "${direction}"`)

  console.log(
    `Reading ${config.alias} from ${projects[env]} (no credentials — see firestore.rules)`
  )
  const { docs, failures } = await fetchRemoteDocs({
    env,
    config,
    limit: args.limit,
    orderByField,
    direction,
    onProgress: (fetched, kept) =>
      console.log(`  fetched ${fetched}, kept ${kept}`)
  })

  const count = writeCorpus({
    alias: config.alias,
    source: env,
    docs,
    schema: config.schema,
    limit: args.limit,
    orderBy: args.orderBy
  })
  console.log(
    `Wrote ${count} docs to ${corpusDir(
      config.alias
    )} (${failures} conversion failures)`
  )
}

yargs(hideBin(process.argv))
  .scriptName("search-eval")
  .command(
    "corpus",
    "build a corpus from a live project (dev/prod, no credentials needed)",
    yargs =>
      yargs.options({
        limit: { number: true, describe: "cap the number of documents" },
        "order-by": {
          string: true,
          describe:
            "field[:asc|desc] to page in, e.g. publishedAt:desc (default: the config's id field)"
        }
      }),
    (args: Args) => buildRemoteCorpus(args)
  )
  .command(
    "seed",
    "create and import the eval collection from the corpus snapshot",
    {},
    async (args: Args) => {
      const { evalCollection, collection } = resolveTarget(args)
      await seedCollection(
        resolveClient(args),
        evalCollection.alias,
        collection
      )
    }
  )
  .command(
    "run",
    "run the golden queries and print the relevance scorecard",
    yargs =>
      yargs.options({
        out: { string: true, describe: "write results JSON to this path" },
        "court-filter": {
          boolean: true,
          default: true,
          describe: "filter to the corpus majority court, like the app does"
        }
      }),
    (args: Args) => runEval(args)
  )
  .command(
    "label",
    "write a labeling sheet with each query's top 10 results",
    yargs =>
      yargs.options({
        only: { string: true, describe: "restrict to one category" }
      }),
    (args: Args) => writeLabelingSheet(args)
  )
  .command(
    "compare <baseline> <candidate>",
    "print metric deltas between two results files",
    yargs =>
      yargs.options({
        threshold: {
          number: true,
          default: 0.05,
          describe: "flag per-query and overall nDCG@10 drops above this"
        }
      }),
    (args: Args & { baseline?: string; candidate?: string }) => {
      const ok = compare(args.baseline!, args.candidate!, args.threshold!)
      if (!ok) process.exitCode = 1
    }
  )
  .options({
    url: { string: true, alias: "u" },
    key: { string: true, alias: "k" },
    env: { choices: ["local", "dev", "prod"], alias: "e" },
    alias: {
      string: true,
      choices: aliases,
      default: "bills",
      describe: "which search collection to evaluate"
    },
    collection: {
      string: true,
      describe:
        "target collection (default: <alias>_eval locally, <alias> on dev/prod)"
    }
  })
  .demandCommand(1)
  .strictCommands().argv
