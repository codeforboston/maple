import { execSync } from "child_process"
import { writeFileSync } from "fs"
import { join } from "path"
import type { SearchParams } from "typesense"
import yargs, { Arguments } from "yargs"
import { hideBin } from "yargs/helpers"
import { supportedGeneralCourts } from "../../functions/src/shared/constants"
import { TypesenseConnectionArgs, resolveClient } from "../typesense-env"
import { EvalCollection, aliases, resolveEvalCollection } from "./collections"
import type { RemoteEnv } from "./remoteCorpus"
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
    court?: number[]
    field?: string
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

/** Everything the two subcommands that read a live project need. Imports are
 * deferred because pulling in the search configs loads firebase-admin, which
 * every other subcommand does without — and `require` rather than `import()`,
 * because under ts-node --swc a dynamic import survives as a native ESM import
 * and fails to resolve the extensionless path.
 */
function remoteSetup(args: Args, command: string) {
  // Args.env is a bare string (see TypesenseConnectionArgs), so the guard is
  // what pins it to a project the remote export can actually read.
  const env: RemoteEnv | undefined =
    args.env === "dev" || args.env === "prod" ? args.env : undefined
  if (!env) throw Error(`${command} needs --env dev or --env prod`)

  const { evalCollection } = resolveTarget(args)
  const remoteCorpus =
    require("./remoteCorpus") as typeof import("./remoteCorpus")
  const corpusFiles = require("./corpusFiles") as typeof import("./corpusFiles")
  const { configForAlias } =
    require("../../functions/src/search/config") as typeof import("../../functions/src/search/config")
  // Loading a collection's search module is what registers its config.
  require("../../functions/src/bills/search")
  require("../../functions/src/hearings/search")
  require("../../functions/src/testimony/search")

  return {
    env,
    alias: evalCollection.alias,
    config: configForAlias(evalCollection.alias),
    fetchRemoteDocs: remoteCorpus.fetchRemoteDocs,
    projects: remoteCorpus.projects,
    writeCorpus: corpusFiles.writeCorpus,
    redactions: corpusFiles.redactions
  }
}

/** Only bills' trigger nests under `{court}`; for every other collection the
 * list is unused, so passing a default costs nothing.
 */
const courtsFor = (args: Args, fallback: readonly number[]) =>
  args.court?.length ? args.court : fallback

/** Builds a corpus from a live project. */
async function buildRemoteCorpus(args: Args) {
  const { env, config, fetchRemoteDocs, projects, writeCorpus } = remoteSetup(
    args,
    "corpus"
  )

  const [orderByField, direction = "asc"] = (args.orderBy ?? "__name__").split(
    ":"
  )
  if (direction !== "asc" && direction !== "desc")
    throw Error(`--order-by direction must be asc or desc, got "${direction}"`)

  const courts = courtsFor(args, supportedGeneralCourts)
  console.log(
    `Reading ${config.alias} from ${projects[env]} (no credentials — see firestore.rules)`
  )
  const { docs, failures } = await fetchRemoteDocs({
    env,
    config,
    courts,
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

/** Copies one field from a live project onto an existing corpus, for a field
 * the corpus's own source predates.
 *
 * The bills corpus is the committed emulator fixture, captured before the LLM
 * `summary` trigger in llm/ existed — all 7,337 documents have no summary, and
 * prod has one for 97.9% of them. Re-exporting bills from prod instead would
 * bring four years of unrelated drift with it: court 192 closed in 2022, so
 * prod's copy has drained out of its policy committees (36 distinct
 * `currentCommittee` values in the fixture against 21 in prod, and none left in
 * Revenue at all), which silently rewrites the member-committee goldens.
 * Joining the one missing field keeps every other value frozen, so a control
 * run reproduces the previous baseline exactly and the field under test is the
 * only thing that moved.
 */
async function enrichCorpus(args: Args) {
  const field = args.field
  if (!field) throw Error("enrich needs --field, e.g. --field summary")

  const {
    env,
    alias,
    config,
    fetchRemoteDocs,
    projects,
    writeCorpus,
    redactions
  } = remoteSetup(args, "enrich")

  // writeCorpus redacts on the way out, and redaction is not idempotent —
  // publishedTestimony's authorUid would be hashed a second time.
  if (redactions[alias])
    throw Error(
      `Cannot enrich "${alias}": its export redacts fields, and rewriting the corpus here would redact them twice.`
    )

  const meta = readMeta(alias)
  const { docs: corpusDocs } = readCorpus(alias)
  // The corpus records which courts it holds, and a court it does not hold can
  // only produce documents the id lookup below throws away — so read those and
  // no more. Defaulting to every supported court downloads the current one in
  // full for nothing.
  const courts = courtsFor(args, Object.keys(meta.courts).map(Number))

  console.log(
    `Reading ${config.alias} from ${projects[env]} for "${field}" (no credentials — see firestore.rules)`
  )
  const { docs: liveDocs, failures } = await fetchRemoteDocs({
    env,
    config,
    courts,
    orderByField: "__name__",
    direction: "asc",
    onProgress: (fetched, kept) =>
      console.log(`  fetched ${fetched}, kept ${kept}`)
  })

  const values = new Map(
    liveDocs
      .filter(
        d => d[field] !== undefined && d[field] !== null && d[field] !== ""
      )
      .map(d => [d.id, d[field]])
  )

  let enriched = 0
  const merged = corpusDocs.map(doc => {
    const value = values.get(doc.id)
    if (value === undefined) return doc
    enriched++
    return { ...doc, [field]: value }
  })

  const count = writeCorpus({
    alias,
    source: meta.source,
    docs: merged,
    schema: config.schema,
    limit: meta.limit,
    orderBy: meta.orderBy,
    // Replace this field's entry, keep every other join's. A corpus that has
    // been enriched twice has to say so, or it stops describing how it was
    // built and the md5 can only tell you the bytes moved.
    enriched: [
      ...(meta.enriched ?? []).filter(e => e.field !== field),
      { field, source: env, count: enriched }
    ]
  })
  console.log(
    `Set "${field}" on ${enriched} of ${count} docs from ${projects[env]} (${failures} conversion failures)`
  )
}

/** Shared by `corpus` and `enrich`; the default differs per command, so the
 * describe text names the flag's purpose rather than a specific fallback. */
const courtOption = {
  array: true,
  number: true,
  describe:
    "general court(s) to read, for collections nested under one (bills). Defaults to every supported court for `corpus`, and to the courts the corpus already holds for `enrich`"
} as const

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
            "field[:asc|desc] to page in, e.g. publishedAt:desc (default: __name__, which needs no index)"
        },
        court: courtOption
      }),
    (args: Args) => buildRemoteCorpus(args)
  )
  .command(
    "enrich",
    "copy one field from a live project onto the existing corpus",
    yargs =>
      yargs.options({
        field: {
          string: true,
          demandOption: true,
          describe: "the field to copy, e.g. summary"
        },
        court: courtOption
      }),
    (args: Args) => enrichCorpus(args)
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
