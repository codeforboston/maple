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

import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

// TODO: move into components directory
const BillCosponsorCard = () => <div>TODO</div>

export default createMeta({
  title: "Dashboard/Mission Center/BillCosponsorCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=245%3A12313",
  component: Cosponsors
})

export const Primary = () => <BillCosponsorCard />

// type CosponsorProps = React.ComponentProps<typeof Cosponsors>

// const Template = (args: CosponsorProps) => <Cosponsors {...args} />

// export const Primary: ComponentStory<typeof Cosponsors> = Template.bind({})

// Primary.decorators = [
//   (Story, ...rest) => {
//     const { store, props } = wrapper.useWrappedStore(...rest)

//     return (
//       <Redux store={store}>
//         <Providers>
//           <Story />
//         </Providers>
//       </Redux>
//     )
//   }
// ]

// const primeSponsor: MemberReference = {
//   Id: "1",
//   Name: "Paul McMurtry",
//   Type: 1
// }

// const currentComm: CurrentCommittee = {
//   id: "2",
//   name: "Joint Committee on Public Health",
//   houseChair: { id: "1", name: "Paul McMurtry", email: "aaa@email.com" }
// }
// var first = { Id: "test", Name: "tes", Type: 0 }

// Primary.args = {
//   bill: {
//     id: "H805",
//     court: 192,
//     content: {
//       Title:
//         "An Act fostering voting opportunities, trust, equity, and security",
//       BillNumber: "H805",
//       DocketNumber: "string",
//       GeneralCourtNumber: 999,
//       PrimarySponsor: first,
//       Cosponsors: [first],
//       LegislationTypeName: "string",
//       Pinslip: "string",
//       DocumentText: "string"
//     },
//     cosponsorCount: 0,
//     testimonyCount: 0,
//     endorseCount: 0,
//     opposeCount: 0,
//     neutralCount: 0,
//     fetchedAt: Timestamp.fromMillis(0),
//     history: [
//       {
//         Date: "1",
//         Branch: "1",
//         Action: "1"
//       }
//     ]
//   }
// }

// Primary.args = {
//   bill: {
//     id: "345",
//     court: 0,
//     content: {
//       Title: "Title",
//       BillNumber: "BillNumber",
//       DocketNumber: "DocketNumber",
//       GeneralCourtNumber: 0,
//       PrimarySponsor: primeSponsor,
//       Cosponsors: [primeSponsor],
//       LegislationTypeName: "",
//       Pinslip: "",
//       DocumentText: ""
//     },
//     cosponsorCount: 1,
//     testimonyCount: 1,
//     endorseCount: 1,
//     opposeCount: 0,
//     neutralCount: 0,
//     nextHearingAt: Timestamp.fromMillis(0),
//     latestTestimonyAt: Timestamp.fromMillis(0),
//     latestTestimonyId: "1",
//     fetchedAt: Timestamp.fromMillis(0),
//     history: [],
//     currentCommittee: currentComm,
//     city: undefined
//   }
// }
