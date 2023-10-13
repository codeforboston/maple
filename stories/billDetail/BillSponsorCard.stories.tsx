import { createMeta } from "stories/utils"
import { Cosponsors } from "components/bill/Cosponsors"
import { ComponentStory } from "@storybook/react"
import { BillProps } from "components/bill/types"
import { Timestamp } from "firebase/firestore"
import { Bill } from "components/db"
import type { CurrentCommittee } from "functions/src/bills/types"

// TODO: move into components directory

export default createMeta({
  title: "Bill Detail/Cosponsors",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=172%3A8380",
  component: Cosponsors
})

const Template: ComponentStory<typeof Cosponsors> = args => (
  <Cosponsors {...args} />
)

export const Primary = Template.bind({})

const newBillHistory = [
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

const newBillContent = {
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

const bill = {
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
    branch: "Joint",
    chamber: "House",
    phone: "617-722-2230",
    email: "committee@committee.org"
  } as CurrentCommittee,
  city: "Boston"
}

Primary.args = {
  bill: bill as Bill
}
