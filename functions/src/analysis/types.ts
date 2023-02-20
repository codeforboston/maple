// import {z} from 'zod'
// export type BillTracker = z.infer<typeof BillTracker>
// export const BillTracker = z.object({
//   id: z.string(),
//   court: z.number(),
//   version: z.number(),
// })

import { Timestamp } from "../firebase"

// export type Stage2 = "billIntroduced" | "firstCommittee"

// export type Stage3 =
//   | {
//       stage:
//       billId: string
//       introducedBy: string
//     }
//   | { stage: "firstCommittee"; billId: string; committee: string }

// type StageCode = Stage3['stage']

// const stageLabels: Record<Stage2, string> = {
//   billIntroduced: "fasldkf asldjf",
//   firstCommittee: "sadlkf jasdlkfj "
// }

// const x = (x: Stage3) => {
//   if (x.stage === "firstCommittee") {
//     x.committee
//   }
// }

export enum Stage {
  billIntroduced = "Bill Introduced",
  firstCommittee = "First Committee",
  secondCommittee = "Second Committee",
  firstChamber = "First Chamber",
  secondChamber = "Second Chamber",
  signed = "Signed By Governor"
}

export type BillTracker = {
  id: string
  court: number
  /** A validated, manual label of the bill status */
  label?: {
    status: Stage
    /** The source of the label, an email address or external dataset */
    attribution: string
    /** When the label was set */
    createdAt: Timestamp
  }
  prediction?: {
    /** The version of the logic that generated this prediction */
    version: number
    status: Stage
    /** When the prediction was set */
    createdAt: Timestamp
  }
}
