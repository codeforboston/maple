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

const CampaignFinanceEntry = Record({
  cashRaised: Number,
  spent: Number,
  inKind: Number
})

const BallotQuestionStatus = Union(
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
      L("advisory"),
      L("referendum")
    ),
    ballotStatus: BallotQuestionStatus,
    ballotQuestionNumber: Union(Number, Null),
    relatedBillIds: Array(String),
    description: Union(String, Null),
    atAGlance: Union(Array(Record({ label: String, value: String })), Null),
    voteEffectYes: Union(String, Null),
    voteEffectNo: Union(String, Null),
    fiscalConsequences: Union(String, Null),
    inFavor: Union(String, Null),
    against: Union(String, Null),
    supportCommittee: Union(String, Null),
    opposeCommittee: Union(String, Null),
    campaignFinancials: Union(
      Record({
        support: Array(CampaignFinanceEntry),
        oppose: Array(CampaignFinanceEntry)
      }),
      Null
    ),
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
    description: null,
    atAGlance: null,
    voteEffectYes: null,
    voteEffectNo: null,
    fiscalConsequences: null,
    inFavor: null,
    against: null,
    supportCommittee: null,
    opposeCommittee: null,
    campaignFinancials: null,
    pdfUrl: null,
    testimonyCount: 0,
    endorseCount: 0,
    neutralCount: 0,
    opposeCount: 0
  }
)
