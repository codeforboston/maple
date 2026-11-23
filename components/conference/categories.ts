import { isSitting, takesTestimony } from "../../functions/src/shared"
import { ConferenceSummary } from "./types"

/** Which bill numbers a row shows: the Senate and House versions, or the
 * report bill. */
export type Bills = "versions" | "report"

/** The categories a conference can be in, built from its existing status,
 * covered and reportBillId fields. A conference is in one category, or in
 * none if its data doesn't fit a rule, like a report status with no report
 * bill. */
export const CATEGORIES = {
  active: { rule: takesTestimony, bills: "versions" },
  notCovered: { rule: c => isSitting(c) && !c.covered, bills: "versions" },
  pending: {
    rule: c => c.status === "reportFiled" && !!c.reportBillId,
    bills: "report"
  },
  enacted: {
    rule: c => c.status === "enacted" && !!c.reportBillId,
    bills: "report"
  },
  failed: {
    rule: c => c.status === "dissolved" && !!c.reportBillId,
    bills: "report"
  },
  dissolved: {
    rule: c => c.status === "dissolved" && !c.reportBillId,
    bills: "versions"
  }
} satisfies Record<
  string,
  { rule: (c: ConferenceSummary) => boolean; bills: Bills }
>

export type Category = keyof typeof CATEGORIES

/** Returns a conference's category, or undefined if none fits. */
export const categoryOf = (c: ConferenceSummary): Category | undefined =>
  (Object.keys(CATEGORIES) as Category[]).find(k => CATEGORIES[k].rule(c))
