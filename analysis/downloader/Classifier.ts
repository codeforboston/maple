import { stringify } from "csv/sync"
import { FileChangeInfo, watch, writeFile } from "fs/promises"
import { groupBy } from "lodash"
import path from "path"
import { performance } from "perf_hooks"
import { loadHistory } from "./loader"
import { Schema } from "./Schema"
import { ClassifiedAction, History } from "./types"
type CtorArgs = {
  actionsPath: string
  rulesPath: string
}

/** Evaluates a schema over actions */
export class Classifier {
  private paths

  private actions?: History
  private schema?: Schema

  constructor({ actionsPath, rulesPath }: CtorArgs) {
    actionsPath = path.resolve(actionsPath)
    const root = path.dirname(actionsPath)
    this.paths = {
      root,
      actions: actionsPath,
      rules: path.resolve(rulesPath),
      unmatched: path.join(root, "unmatched-actions.txt"),
      matched: path.join(root, "matched-actions.txt"),
      overmatched: path.join(root, "overmatched-actions.txt"),
      matchedCsv: path.join(root, "matched-actions.csv"),
      committeeInfo: path.join(root, "committee-info.txt"),
      matchedJson: path.join(root, "matched-actions.json")
    }
  }

  private async classify() {
    const start = performance.now()
    const classified = this.executeSchema()
    const end = performance.now()

    const {
      unmatched = [],
      conflicting = [],
      matched = []
    } = groupBy(classified, a => {
      switch (a.type) {
        case "unknown":
          return "unmatched"
        case "conflicting":
          return "conflicting"
        default:
          return "matched"
      }
    })

    await writeFile(
      this.paths.unmatched,
      unmatched
        .map(r => r.action)
        .sort()
        .join("\n")
    )
    await writeFile(this.paths.matched, this.matchedContent(matched))
    await writeFile(this.paths.matchedJson, JSON.stringify(matched))
    await writeFile(
      this.paths.overmatched,
      this.overmatchedContent(conflicting)
    )

    await writeFile(
      this.paths.matchedCsv,
      stringify(matched, {
        columns: [
          { key: "id", header: "Bill ID" },
          { key: "branch", header: "Branch" },
          { key: "type", header: "Action Type" },
          { key: "context", header: "Action Context" },
          { key: "action", header: "Raw Action" }
        ],
        quote: "'",
        escape: "\\"
      })
    )

    await writeFile(this.paths.committeeInfo, this.committeeInfo(matched))
    console.log(
      `Classified (${(end - start).toFixed(2)} ms):`,
      "unmatched",
      unmatched.length,
      "matched",
      matched.length,
      "conflicting",
      conflicting.length
    )
  }

  committeeInfo(results: ClassifiedAction[]) {
    const committeeTypes = new Set([
      "referred",
      "accompanied",
      "accompaniedBy",
      "report",
      "newDraft"
    ])

    const actions = results.filter(r => committeeTypes.has(r.type))

    const byBill = groupBy(actions, a => a.id)

    const content = Object.entries(byBill)
      .flatMap(([id, actions]) => [
        `\n${id}:`,
        ...actions.map(
          a =>
            `  ${a.date.toLocaleDateString()} ${a.type} ${a.branch}:\n    ${
              a.action
            }`
        )
      ])
      .join("\n")

    return content
  }

  matchedContent(results: ClassifiedAction[]) {
    const byType = groupBy(results, r => r.type)
    const content = Object.entries(byType).flatMap(([type, results]) => [
      `\n${type}:`,
      ...results
        .map(r => {
          return `    ${r.action}${
            r.context ? `; context: ${JSON.stringify(r.context)}` : ""
          }`
        })
        .sort()
    ])
    return content.join("\n")
  }

  overmatchedContent(conflicting: ClassifiedAction[]) {
    const content = [
      ...conflicting
        .map(r => {
          const types = r.context?.types as string[]
          return `${r.action}; types: ${types}`
        })
        .sort()
    ]
    return content.join("\n")
  }

  private executeSchema() {
    return this.actions!.map(action => this.schema!.classify(action))
  }

  run = async () => {
    delete require.cache[this.paths.rules]
    let rules
    try {
      rules = (await import(this.paths.rules)).rules
      this.schema = new Schema(rules)
    } catch (e) {
      console.error("Error loading schema:", e)
      return
    }
    this.actions = await loadHistory(this.paths.actions)

    try {
      await this.classify()
    } catch (e) {
      console.error("Error classifying:", e)
    }
  }

  async watch() {
    await this.run()
    await Promise.all([
      this.watchFile(this.paths.actions, this.run),
      this.watchFile(this.paths.rules, this.run)
    ])
  }

  private async watchFile(
    path: string,
    handler: (info: FileChangeInfo<string>) => void
  ) {
    for await (const i of watch(path)) {
      handler(i)
    }
  }
}
