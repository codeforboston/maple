import { Meta, StoryObj } from "@storybook/react"
import { Cosponsors as PreCosponsors } from "components/bill/Cosponsors"
import { BillProps } from "components/bill/types"
import { Bill, BillContent, BillHistory } from "components/db"
import { Timestamp } from "firebase/firestore"
import { ReactNode } from "react"

// TODO: move into components directory

const Cosponsors = (props: BillProps & { children: ReactNode }) => (
  <PreCosponsors {...props} />
)

const meta: Meta = {
  title: "Organisms/Bill Detail/Cosponsors",
  component: Cosponsors
}
export default meta

type Story = StoryObj<typeof Cosponsors>

export const Primary: Story = {
  name: "Cosponsors",
  decorators: [(Story, children) => <Story {...children} />]
}
const newBillHistory: BillHistory = [
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

const newBillContent: BillContent = {
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

const bill: Bill = {
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
  similar: []
}

Primary.args = {
  bill: bill,
  children: "View Cosponsors"
}
