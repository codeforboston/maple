import * as fs from "fs"
import * as path from "path"
import * as yaml from "js-yaml"
import { BallotQuestion } from "../../functions/src/ballotQuestions/types"
import { Script } from "./types"

const listYamlFiles = (dir: string, baseDir = dir): string[] => {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...listYamlFiles(entryPath, baseDir))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".yaml")) {
      files.push(path.relative(baseDir, entryPath))
    }
  }

  return files
}

export const script: Script = async ({ db, args }) => {
  const dir =
    typeof args.dir === "string"
      ? args.dir
      : path.resolve(process.cwd(), "ballotQuestions")

  const files = listYamlFiles(dir)

  if (files.length === 0) {
    console.log(`No YAML files found in ${dir}`)
    return
  }

  const batch = db.batch()

  for (const file of files) {
    const raw = yaml.load(fs.readFileSync(path.join(dir, file), "utf8"))
    const doc = BallotQuestion.check(raw)
    const ref = db.collection("ballotQuestions").doc(doc.id)
    batch.set(ref, doc)
    console.log(`Queued upsert: ballotQuestions/${doc.id}`)
  }

  await batch.commit()
  console.log(`Committed ${files.length} ballot question(s) from directory tree.`)
}
