import { parse, stringify } from "csv/sync"
import { readFileSync, writeFileSync } from "fs"
import { BillHistory } from "../../functions/src/bills/types"
import { db } from "../../functions/src/firebase"
import {
  currentGeneralCourt,
  parseApiDateTime
} from "../../functions/src/malegislature"
import { ClassifiedAction, History } from "./types"

const historyColumns = ["id", "action", "branch", "date"]

export const downloadHistory = async (outBase: string) => {
  const result = await db
    .collection(`generalCourts/${currentGeneralCourt}/bills`)
    .select("history")
    .get()
  const allActions = result.docs.flatMap(d => {
    const history = BillHistory.check(d.data().history)
    return history.map(({ Date, Action, Branch }) => ({
      date: parseApiDateTime(Date).toDate(),
      action: Action.trim().replaceAll(/\s+/g, " "),
      branch: Branch,
      id: d.id
    }))
  })
  const csv = stringify(allActions, {
    header: true,
    cast: { date: d => d.toISOString() },
    columns: historyColumns
  })
  writeFileSync(`${outBase}.csv`, csv)
}

export const loadHistory = async (path: string) => {
  const history = parse(readFileSync(path), {
    columns: historyColumns,
    fromLine: 1,
    cast: (value, { column }) => {
      if (column === "date") return new Date(value)
      else return value
    }
  })
  return History.check(history)
}

export const loadMatchedActions = async (path: string) => {
  return JSON.parse(readFileSync(path).toString()) as ClassifiedAction[]
}
