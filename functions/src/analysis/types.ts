// import {z} from 'zod'
// export type BillTracker = z.infer<typeof BillTracker>
// export const BillTracker = z.object({
//   id: z.string(),
//   court: z.number(),
//   version: z.number(),
// })

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
  version: number
  status: Stage
}

