import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { Bill } from "components/db"
import { BillDetails } from "components/bill/BillDetails"
import { Timestamp } from "firebase/firestore"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"


// mock window match media
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// mocking dependencies:
jest.mock('components/featureFlags', () => ({
  useFlags: () => ({
    testimonyDiffing: false,
    notifications: true,
    billTracker: true,
    followOrg: true,
    lobbyingTable: false
  })
}));

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const mockBill: Bill = {
  id: "S1653",
  court: 193,
  content: {
    BillNumber: "S1653",
    PrimarySponsor: {
      Name: "Ryan C. Fattman",
      Id: "RCF0",
      Type: 1
    },
    DocketNumber: "SD1568",
    Title:
      "An Act authorizing the appointment of special police officers in the town of Charlton",
    DocumentText:
      "\tSECTION 1. The chief of police of the town of Charlton may appoint, if the chief deems necessary, individuals with a law enforcement background as special police officers for the purpose of performing police details or any other police duties arising from or during the course of police detail work, whether or not related to the detail work. Prior to appointment under this act, a special police officer shall pass a medical examination conducted by a physician or other certified professional chosen by the town to determine that the special police officer is capable of performing the essential duties of a special police officer, the cost of which shall be borne by the special police officer.\r\n\tSECTION 2. Notwithstanding section 1 of chapter 32 of the General Laws or any other general or special law to the contrary, a special police officer appointed pursuant to this act shall not be subject to the maximum age restrictions applied to regular officers under chapter 32 of the General Laws; provided, however, that a special police officer appointed pursuant to this act shall not be eligible to serve as a special police officer upon reaching the age of 70.\r\n\tSECTION 3. Special police officers appointed under this act shall be subject to the limitation on hours worked and other restrictions on earnings as provided in paragraph (b) of section 91 of chapter 32 of the General Laws.\r\n\tSECTION 4. Special police officers shall be subject to the rules and regulations, policies, procedures and requirements of the chief of police of the town of Charlton including, but not limited to, restrictions on the type of detail assignments, requirements regarding medical examinations to determine continuing capability to perform the duties of a special police officer, requirements for training, requirements for firearms licensing and qualifications and requirements regarding uniforms and equipment. Such special police officers shall comply with all requirements of chapter 6E of the General Laws, including: (i) maintaining certification and good standing with the Massachusetts Peace Officer Standards and Training Commission; and (ii) complying with all annual in-service and other training requirements mandated by the municipal police training committee.\r\n\tSECTION 5. This act shall take effect upon passage.\r\n",
    LegislationTypeName: "Bill",
    Pinslip:
      "By Mr. Fattman, a petition (accompanied by bill, Senate, No. 1653) of Ryan C. Fattman (by vote of the town) for legislation to authorize the appointment of special police officers in the town of Charlton.  Public Service.  [Local Approval Received.]",
    Cosponsors: [
      {
        Type: 1,
        Id: "RCF0",
        Name: "Ryan C. Fattman"
      }
    ],
    GeneralCourtNumber: 193
  },
  cosponsorCount: 1,
  testimonyCount: 2,
  endorseCount: 2,
  opposeCount: 0,
  neutralCount: 0,
  nextHearingAt: new Timestamp(1680616800, 0),
  latestTestimonyAt: new Timestamp(1718147489, 987000000),
  latestTestimonyId: "F2euSWhugXXPzb38jk_EJ",
  fetchedAt: new Timestamp(1718811579, 935000000),
  history: [
    {
      Action: "Referred to the committee on Public Service",
      Branch: "Senate",
      Date: "2023-02-16T11:17:15.563"
    },
    {
      Branch: "House",
      Date: "2023-02-16T11:17:15.563",
      Action: "House concurred"
    },
    {
      Date: "2023-03-29T16:13:01.983",
      Action:
        "Hearing scheduled for 04/04/2023 from 10:00 AM-01:00 PM in A-1    ",
      Branch: "Joint"
    },
    {
      Action: "Accompanied a new draft, see S2416",
      Date: "2023-07-13T00:00:00",
      Branch: "Senate"
    }
  ],
  city: "Sample City"
}

// set up Redux mock store
const mockStore = configureStore([])

describe("BillDetails", () => {
  let store

  // before each Bill Details test, initialize a stor with an auth slice
  // publish slice is needed because the ThankYouModal uses usePublishState hook
  beforeEach(() => {
    store = mockStore({
      auth: {
        authenticated: false,
        user: null,
        claims: null
      },
      publish: {
        service: {},
        showThankYou: false
      }
    })
  })

  it("renders bill title", () => {
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    )
    const titleElement = screen.getByText(mockBill.id)
    expect(titleElement).toBeInTheDocument()
  })

  

})
