import { Timestamp } from "common/types"
import { Bill, BillContent, BillHistory } from "common/bills/types"

export const newBillHistory: BillHistory = [
  {
    Date: new Date().toISOString(),
    Branch: "House",
    Action: "this is the action"
  },
  {
    Date: new Date().toISOString(),
    Branch: "House",
    Action: "this is the action"
  },
  {
    Date: new Date().toISOString(),
    Branch: "House",
    Action: "this is the action"
  },
  {
    Date: new Date().toISOString(),
    Branch: "House",
    Action: "this is the action"
  }
]
export const newBillContent: BillContent = {
  Title: "An Act relative to the safety of autistic and alzheimer individuals",
  BillNumber: "H. 1728",
  DocketNumber: "HD. 2027",
  GeneralCourtNumber: 192,
  PrimarySponsor: {
    Id: "1",
    Name: "Paul McMurtry",
    Type: 1
  },
  Cosponsors: [
    {
      Id: "2",
      Name: "Paul McMurtry",
      Type: 1
    },
    {
      Id: "3",
      Name: "Paul McMurtry",
      Type: 1
    },
    {
      Id: "4",
      Name: "Paul McMurtry",
      Type: 1
    }
  ],
  LegislationTypeName: "House",
  Pinslip: "",
  DocumentText: "this is the document text"
}

export const newBillTopics = [
  {
    category: "Crime and Law Enforcement",
    topic: "Criminal investigation, prosecution, interrogation"
  },
  {
    category: "Economics and Public Finance",
    topic: "Budget process"
  }
]

export const bill: Bill = {
  id: "123",
  court: 192,
  content: newBillContent,
  cosponsorCount: 0,
  testimonyCount: 0,
  endorseCount: 0,
  opposeCount: 0,
  neutralCount: 0,
  fetchedAt: Timestamp.fromDate(new Date()),
  history: newBillHistory,
  currentCommittee: {
    name: "Committee on Public Safety and Homeland Security",
    id: "J30",
    houseChair: {
      id: "1",
      name: "Paul McMurtry",
      email: "a@b.com"
    }
  },
  city: "Boston",
  topics: newBillTopics,
  summary: "This is the summary",
  similar: []
}
