import { createMeta } from "stories/utils"
import { Cosponsors } from "components/bill/Cosponsors"
import type {
  MISSING_TIMESTAMP,
  CurrentCommittee,
  CommitteeMember
} from "functions/src/bills/types"
import { Timestamp } from "firebase/firestore"
import { BillProps } from "components/bill/types"
import { ComponentStory } from "@storybook/react"
import type { MemberReference } from "components/db"
import React from "react"
// TODO: move into components directory
// const BillCosponsorCard = () => <div>TODO</div>

export default createMeta({
  title: "Dashboard/Mission Center/BillCosponsorCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=245%3A12313",
  component: Cosponsors
})

type CosponsorProps = React.ComponentProps<typeof Cosponsors>

const Template = (args: CosponsorProps) => <Cosponsors {...args} />

export const Primary: ComponentStory<typeof Cosponsors> = Template.bind({})

const primeSponsor: MemberReference = {
  Id: "1",
  Name: "Paul McMurtry",
  Type: 1
}

const currentComm: CurrentCommittee = {
  id: "2",
  name: "Joint Committee on Public Health",
  houseChair: { id: "1", name: "Paul McMurtry", email: "aaa@email.com" }
}

Primary.args = {
  bill: {
    id: "345",
    court: 0,
    content: {
      Title: "Title",
      BillNumber: "BillNumber",
      DocketNumber: "DocketNumber",
      GeneralCourtNumber: 0,
      PrimarySponsor: primeSponsor,
      Cosponsors: [primeSponsor],
      LegislationTypeName: "",
      Pinslip: "",
      DocumentText: ""
    },
    cosponsorCount: 1,
    testimonyCount: 1,
    endorseCount: 1,
    opposeCount: 0,
    neutralCount: 0,
    nextHearingAt: Timestamp.fromMillis(0),
    latestTestimonyAt: Timestamp.fromMillis(0),
    latestTestimonyId: "1",
    fetchedAt: Timestamp.fromMillis(0),
    history: [],
    currentCommittee: currentComm,
    city: undefined
  }
}
