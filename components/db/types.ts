export type BillContent = {
  Title: string
  BillNumber: string
  DocketNumber: string
  GeneralCourtNumber: number
  PrimarySponsor: MemberReference
  Cosponsors: MemberReference[]
  LegislationTypeName: string
  Pinslip: string
  DocumentText: string
}

export type Bill = {
  content: BillContent
  fetchedAt: Date
  id: string
}

export type MemberReference = {
  Id: string
  Name: string
  Type: number
}

export type CommitteeReference = {
  CommitteeCode: string
  GeneralCourtNumber: number
}

export type MemberContent = {
  Name: string
  GeneralCourtNumber: number
  LeadershipPosition: string | null
  Branch: string
  MemberCode: string
  District: string
  Party: string
  EmailAddress: string
  RoomNumber: string
  PhoneNumber: string
  FaxNumber: string | null
  Committees: CommitteeReference[]
}

export type Member = {
  content: MemberContent
  fetchedAt: Date
  id: string
}
