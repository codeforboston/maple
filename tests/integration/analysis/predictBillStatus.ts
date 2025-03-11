import { BillHistory } from "../bills/types"
import { Stage } from "./types"

export function predictBillStatus(newHistory: BillHistory): Stage {
  for (let [p, r] of stageChecks) {
    if (p(newHistory.reverse())) {
      return r
    }
  }
  return Stage.billIntroduced
}
