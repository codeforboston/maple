import {
  Array,
  Literal as L,
  Null,
  Number,
  Record,
  Static,
  String,
  Union,
} from "runtypes"

export const BallotQuestion = Record({
  id: String,
  billId: String,
  court: Number,
  electionYear: Number,
  type: Union(
    L("initiative_statute"),
    L("initiative_constitutional"),
    L("legislative_referral"),
    L("constitutional_amendment"),
    L("advisory")
  ),
  ballotStatus: Union(
    L("legislature"),
    L("ballot"),
    L("enacted"),
    L("failed"),
    L("withdrawn")
  ),
  ballotQuestionNumber: Union(Number, Null),
  relatedBillIds: Array(String),
})

export type BallotQuestion = Static<typeof BallotQuestion>
