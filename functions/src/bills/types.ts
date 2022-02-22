import { InstanceOf, Number, Optional, Record, Static, Unknown } from "runtypes"
import { Id, withDefaults } from "../common"
import { Timestamp } from "../firebase"

export type Bill = Static<typeof Bill>
export const Bill = withDefaults(
  Record({
    id: Id,
    content: Unknown,
    cosponsorCount: Number,
    testimonyCount: Number,
    nextHearingAt: Optional(InstanceOf(Timestamp)),
    latestTestimonyAt: Optional(InstanceOf(Timestamp)),
    latestTestimonyId: Optional(Id),
    fetchedAt: InstanceOf(Timestamp)
  }),
  { cosponsorCount: 0, testimonyCount: 0 }
)
