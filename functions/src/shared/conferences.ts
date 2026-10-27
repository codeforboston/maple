import type { ConferenceStatus } from "../conferences/types"

/** Testimony is taken while the committee is still deciding which version to
 * report. */
export const takesTestimony = (status: ConferenceStatus) =>
  status === "appointed"
