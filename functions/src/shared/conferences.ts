import type { Conference } from "../conferences/types"

/** Testimony is taken while the committee is still deciding which version to
 * report, on the conferences we cover. A document synced before `covered`
 * existed counts as covered. */
/** Once the report is filed, the committee has decided: each question says
 * how the law resolved it. */
export const hasReport = (c: Pick<Conference, "status">) =>
  c.status === "reportFiled" || c.status === "enacted"

export const takesTestimony = (c: Pick<Conference, "status" | "covered">) =>
  c.status === "appointed" && c.covered !== false
