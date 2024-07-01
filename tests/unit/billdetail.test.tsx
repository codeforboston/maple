import "@testing-library/jest-dom"
import { render, screen, fireEvent } from "@testing-library/react"
import { Bill } from "components/db"
import { BillDetails } from "components/bill/BillDetails"
import { Timestamp } from "firebase/firestore"
import { Provider } from "react-redux"
import { thunk } from "redux-thunk" // Import redux-thunk
import configureStore from "redux-mock-store"
import { BillNumber } from "components/bill/BillNumber"
import { useState } from "react"

// mock window match media
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// mock bill (later used in redux store)
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
      "\tSECTION 1. The chief of police of the town of Charlton may appoint, if the chief deems necessary, individuals with a law enforcement background as special police officers...\r\n",
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

// mocking dependencies:

// setting mock feature flags
jest.mock("components/featureFlags", () => ({
  useFlags: () => ({
    testimonyDiffing: false,
    notifications: true,
    billTracker: true,
    followOrg: true,
    lobbyingTable: false
  })
}))

// translation dependency -mocking so that we aren't actually translating anything in this test
jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

// Mock resolveBill
jest.mock("components/publish/hooks", () => ({
  ...jest.requireActual("components/publish/hooks"),
  resolveBill: bill => dispatch => {
    dispatch({ type: "publish/setBill", payload: bill })
  }
}))

// mock child components
jest.mock("components/bill/BillNumber", () => ({
  BillNumber: () => <div data-testid="title">Mocked Title</div>
}))

jest.mock("components/bill/Status", () => ({
  Status: () => <div data-testid="status">Mocked Status</div>
}))

jest.mock("components/bill/Summary", () => ({
  Summary: ({ bill }) => {
    const [showModal, setShowModal] = useState(false)
    return (
      <div data-testid="summary">
        Mocked Summary
        <button onClick={() => setShowModal(true)}>Read more..</button>
        {showModal && (
          <div data-testid="bill-text-modal">
            <div>{bill.content.DocumentText}</div>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        )}
      </div>
    )
  }
}))

jest.mock("components/bill/SponsorsAndCommittees", () => ({
  Sponsors: () => <div data-testid="sponsors">Mocked Sponsors</div>,
  Committees: () => <div data-testid="committees">Mocked Committees</div>,
  Hearing: () => <div data-testid="hearing">Mocked Hearing</div>
}));



// set up Redux mock store with thunk middleware bc resolveBill is thunk
const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("BillDetails", () => {
  let store

  // before each Bill Details test, initialize a store with an auth slice
  // publish slice is needed because the ThankYouModal uses usePublishState hook
  // bill needs to be stored bc resolveBill sets it
  beforeEach(() => {
    store = mockStore({
      auth: {
        authenticated: false,
        user: null,
        claims: null
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill
      }
    })

    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    )
  })

  test("renders bill title", () => {
    const title = screen.getByTestId("title")
    expect(title).toBeInTheDocument()
  })

  test("renders bill status", () => {
    const status = screen.getByTestId("status")
    expect(status).toBeInTheDocument()
  })

  test("renders bill summary", () => {
    const summary = screen.getByTestId("summary")
    expect(summary).toBeInTheDocument()
  })

  test("renders full text", async () => {
    // Check for "Read more.." button
    const readMoreButton = screen.getByText("Read more..")
    expect(readMoreButton).toBeInTheDocument()

    // Click the "Read more.." button
    fireEvent.click(readMoreButton)

    // Check if the modal with full text is displayed
    const modal = await screen.findByTestId("bill-text-modal")
    expect(modal).toBeInTheDocument()

    // Check if the full text is in the modal
    const fullText = screen.getByText((content, element) => {
      return content.includes(
        "SECTION 1. The chief of police of the town of Charlton may appoint, if the chief deems necessary, individuals with a law enforcement background as special police officers"
      )
    })
    expect(fullText).toBeInTheDocument()
  })

  test("renders bill sponsors", () => {
    const sponsors = screen.getByTestId("sponsors")
    expect(sponsors).toBeInTheDocument()
  })

  



})
