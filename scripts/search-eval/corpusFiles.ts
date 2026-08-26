/** Writing the corpus artifacts. Shared by the two ways a corpus is produced:
 * the emulator export (scripts/firebase-admin/exportSearchCorpus.ts, admin SDK,
 * rules bypassed) and the credential-free remote export (./remoteCorpus.ts,
 * client SDK, subject to security rules).
 */
import { createHash } from "crypto"
import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"
import { gzipSync } from "zlib"
import type { Schema } from "../../functions/src/search/config"
import { corpusDir } from "./corpus"

export type ExportedDoc = { id: string; court: number } & Record<
  string,
  unknown
>

/** Fields rewritten before a document is written to the corpus. None of them
 * are in the collection's query_by (components/search/searchParams.ts), so
 * redacting them changes nothing the eval measures — it keeps identifiers the
 * app never exposes out of a committed artifact.
 */
export const redactions: Record<
  string,
  { fields: string[]; apply: (doc: ExportedDoc) => ExportedDoc }
> = {
  publishedTestimony: {
    fields: ["authorUid", "fullName"],
    apply: doc => ({
      ...doc,
      authorUid: createHash("sha1")
        .update(String(doc.authorUid))
        .digest("hex")
        .slice(0, 16),
      fullName: String(doc.authorDisplayName ?? "")
    })
  }
}

export function writeCorpus({
  alias,
  source,
  docs,
  schema,
  limit,
  orderBy
}: {
  alias: string
  /** Where the documents came from: an env name, or the fixture path. */
  source: string
  docs: ExportedDoc[]
  schema: Schema
  limit?: number
  orderBy?: string
}): number {
  const redact = redactions[alias]

  const byId = new Map<string, ExportedDoc>()
  for (const doc of docs) byId.set(doc.id, redact ? redact.apply(doc) : doc)

  // Sorted by id so the corpus — and its md5 — is stable across exports that
  // paged in a different order.
  const ids = Array.from(byId.keys()).sort()
  const jsonl = ids.map(id => JSON.stringify(byId.get(id))).join("\n") + "\n"

  const courts: Record<string, number> = {}
  for (const id of ids) {
    const court = String(byId.get(id)!.court)
    courts[court] = (courts[court] ?? 0) + 1
  }

  const outDir = corpusDir(alias)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, "docs.jsonl.gz"), gzipSync(jsonl))
  writeFileSync(
    join(outDir, "schema.json"),
    JSON.stringify(schema, null, 2) + "\n"
  )
  writeFileSync(
    join(outDir, "meta.json"),
    JSON.stringify(
      {
        alias,
        source,
        count: ids.length,
        courts,
        jsonlMd5: createHash("md5").update(jsonl).digest("hex"),
        ...(limit === undefined ? {} : { limit }),
        ...(orderBy === undefined ? {} : { orderBy }),
        ...(redact === undefined ? {} : { redacted: redact.fields })
      },
      null,
      2
    ) + "\n"
  )

  return ids.length
}
