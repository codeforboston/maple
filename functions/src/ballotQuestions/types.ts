import {
  Array,
  Literal as L,
  Null,
  Number,
  Record,
  Static,
  String,
  Union
} from "runtypes"
import { withDefaults } from "../common"

const BallotQuestionStatus = Union(
  L("legislature"),
  L("qualifying"),
  L("certified"),
  L("ballot"),
  L("enacted"),
  L("failed"),
  L("withdrawn"),
  L("expectedOnBallot"),
  L("failedToAppear"),
  L("rejected"),
  L("accepted")
)

export type BallotQuestion = Static<typeof BallotQuestion>
export const BallotQuestion = withDefaults(
  Record({
    id: String,
    billId: Union(String, Null),
    court: Number,
    electionYear: Number,
    type: Union(
      L("initiative_statute"),
      L("initiative_constitutional"),
      L("legislative_referral"),
      L("constitutional_amendment"),
      L("advisory")
    ),
    ballotStatus: BallotQuestionStatus,
    ballotQuestionNumber: Union(Number, Null),
    relatedBillIds: Array(String),
    description: Union(String, Null),
    atAGlance: Union(Array(Record({ label: String, value: String })), Null),
    fullSummary: Union(String, Null),
    pdfUrl: Union(String, Null),
    title: Union(String, Null),
    testimonyCount: Number,
    endorseCount: Number,
    neutralCount: Number,
    opposeCount: Number
  }),
  {
    title: null,
    testimonyCount: 0,
    endorseCount: 0,
    neutralCount: 0,
    opposeCount: 0
  }
)
