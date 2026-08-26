import { execSync } from "child_process"
import { writeFileSync } from "fs"
import { join } from "path"
import type { SearchParams } from "typesense"
import yargs, { Arguments } from "yargs"
import { hideBin } from "yargs/helpers"
import { billsSearchParams } from "../../components/search/searchParams"
import { TypesenseConnectionArgs, resolveClient } from "../typesense-env"
import {
  CorpusDoc,
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
    collection?: string
    out?: string
    courtFilter?: boolean
    only?: string
    threshold?: number
  }
>

const resolveCollection = (args: Args) =>
  args.collection ?? (args.env === "local" ? "bills_eval" : "bills")

const includeFields = "id,court,number,title,primarySponsor,currentCommittee"

/** The typesense client's own search params, with the fields every eval
 * search must pin made required. New ranking knobs added to
 * components/search/searchParams.ts flow through without edits here.
 */
type EvalSearchParams = SearchParams<CorpusDoc> & {
  q: string
  query_by: string
  per_page: number
}

function createSearcher(args: Args, collection: string) {
  const client = resolveClient(args)
  return {
    client,
    search: async (params: EvalSearchParams): Promise<CorpusDoc[]> => {
      const result = await client
        .collections<CorpusDoc>(collection)
        .documents()
        .search({ include_fields: includeFields, ...params })
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

// The ranking params under test: everything the app sends except
// exclude_fields, which conflicts with the eval's pinned include_fields.
const { exclude_fields: _, ...billsRankingParams } = billsSearchParams

const searchTop10 = (
  search: ReturnType<typeof createSearcher>["search"],
  query: GoldenQuery,
  goldens: GoldenSet,
  court: number | undefined
) =>
  search({
    ...billsRankingParams,
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
  const goldens = loadGoldens()
  const collection = resolveCollection(args)
  const { client, search } = createSearcher(args, collection)
  const localDocs = args.env === "local" ? readCorpus().docs : undefined
  const meta = readMeta()
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

    const top10 = await searchTop10(search, query, goldens, court)
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

async function writeLabelingSheet(args: Args) {
  const goldens = loadGoldens()
  const collection = resolveCollection(args)
  const { search } = createSearcher(args, collection)
  const queries = goldens.queries.filter(
    q => !args.only || q.category === args.only
  )

  const sections: string[] = [
    "# Search eval labeling sheet",
    "",
    `Top 10 results per golden query (collection "${collection}", sort "${goldens.defaults.sort_by}").`,
    "Grade each result: 3 = exactly what the searcher wanted, 1 = relevant, 0/blank = not relevant.",
    "Merge grades into tests/search-eval/goldens/bills.json as explicit docId entries.",
    ""
  ]
  const majority = majorityCourt(readMeta())
  for (const query of queries) {
    const court = courtFor(query, goldens, args, majority)
    const top10 = await searchTop10(search, query, goldens, court)
    sections.push(
      `## ${query.id} (${query.category}): "${query.query}"`,
      "",
      "| grade | rank | docId | number | title | primarySponsor |",
      "| --- | --- | --- | --- | --- | --- |",
      ...top10.map(
        (d, i) =>
          `|  | ${i + 1} | ${d.id} | ${d.number} | ${(d.title ?? "").replace(
            /\|/g,
            "/"
          )} | ${d.primarySponsor ?? ""} |`
      ),
      ""
    )
  }

  const path = join(__dirname, "../../tests/search-eval/labeling-sheet.md")
  writeFileSync(path, sections.join("\n"))
  console.log(`Wrote labeling sheet for ${queries.length} queries to ${path}`)
}

yargs(hideBin(process.argv))
  .scriptName("search-eval")
  .command(
    "seed",
    "create and import the eval collection from the corpus snapshot",
    {},
    async (args: Args) => {
      await seedCollection(resolveClient(args), resolveCollection(args))
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
    collection: {
      string: true,
      describe:
        "target collection (default: bills_eval locally, bills on dev/prod)"
    }
  })
  .demandCommand(1)
  .strictCommands().argv
