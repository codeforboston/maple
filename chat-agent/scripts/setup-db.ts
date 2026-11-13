/**
 * One-time (idempotent) database setup, run at deploy time rather than at startup:
 * the chat schema and the PostgresSaver checkpoint tables.
 *   yarn --cwd chat-agent setup-db
 */
import { readFileSync } from "fs"
import { join } from "path"
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { embeddingConfig, getPool } from "../src/db"

async function main() {
  const db = getPool()
  await db.query(readFileSync(join(__dirname, "../sql/001_schema.sql"), "utf8"))
  // Records the embedding config memories are written with; the startup check compares against it.
  const { model, dims } = embeddingConfig()
  await db.query(
    `insert into embedding_meta values ('chat_memories', $1, $2) on conflict do nothing`,
    [model, dims]
  )
  await new PostgresSaver(db).setup()
  console.log("chat schema and checkpoint tables ready")
  await db.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
