export type Legislator = {
  Id: string
  Name: string
  Type: number
}

export type Bill = {
  Title: string
  BillNumber: string | null
  DocketNumber: string
  GeneralCourtNumber: number
  PrimarySponsor: Legislator
  Cosponsors: Legislator[]
  LegislationTypeName: string
  Pinslip: string
  DocumentText: string
  fetchedAt: Date
}
