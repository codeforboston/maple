import { BillCosponsorCard } from "components/dashboard/BillCosponsorCard"
import { Bill } from "components/db/bills"
import { Timestamp } from "firebase/firestore"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Dashboard/Mission Center/BillCosponsorCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=245%3A12313",
  component: BillCosponsorCard
})

const bill: Bill = {
  id: '1234',
  court: 193,
  content: {
    Pinslip: 'test pinslip',
    Title: 'a bill to do legislative things',
    PrimarySponsor: {
      "Id": "JSC1",
      "Name": "Josh S. Cutler",
      "Type": 1,
      "ResponseDate": "2023-01-17T15:14:22.9133333"
    },
    Cosponsors: [
      {
        "Id": "JSC1",
        "Name": "Josh S. Cutler",
        "Type": 1,
        "ResponseDate": "2023-01-17T15:14:22.9133333"
      },
      {
        "Id": "KPL1",
        "Name": "Kathleen R. LaNatra",
        "Type": 1,
        "ResponseDate": "2023-01-17T16:13:57.6333333"
      },
      {
        "Id": "V_H1",
        "Name": "Vanna Howard",
        "Type": 1,
        "ResponseDate": "2023-02-27T10:26:30.92"
      }
    ],
    DocumentText: 'document text',
    BillNumber: 'H1234',
    DocketNumber: '1234',
    GeneralCourtNumber: 193,
    LegislationTypeName: ''
},
city: 'Boston',
cosponsorCount: 0,
testimonyCount: 0,
endorseCount: 0,
neutralCount: 0,
opposeCount: 0,
fetchedAt: Timestamp.fromMillis(0),
history: [],
}

export const Primary = () => <BillCosponsorCard bill={bill} />
