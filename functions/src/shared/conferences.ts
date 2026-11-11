import type { Conference } from "../conferences/types"
import type { ConferencePosition } from "../testimony/types"

/** Once the report is filed, the committee has decided: each question says
 * how the law resolved it. */
export const hasReport = (c: Pick<Conference, "status">) =>
  c.status === "reportFiled" || c.status === "enacted"

/** Testimony is taken while the committee is still deciding which version to
 * report, on the conferences we cover. A document synced before `covered`
 * existed counts as covered. */
export const takesTestimony = (c: Pick<Conference, "status" | "covered">) =>
  c.status === "appointed" && c.covered !== false

// The site's wording, conferences input.position.*.long; a test holds them equal.
export const CONFERENCE_STANCES: Record<ConferencePosition, string> = {
  passSomething: "Please pass something",
  passSenateVersion: "Pass the Senate version",
  passHouseVersion: "Pass the House version",
  passNothing: "Don't pass anything"
}
