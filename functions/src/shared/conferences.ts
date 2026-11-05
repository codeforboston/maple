import type { Conference } from "../conferences/types"

/** Testimony is taken while the committee is still deciding which version to
 * report, on the conferences we cover. A document synced before `covered`
 * existed counts as covered. */
export const takesTestimony = (c: Pick<Conference, "status" | "covered">) =>
  c.status === "appointed" && c.covered !== false
