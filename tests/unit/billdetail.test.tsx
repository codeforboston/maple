import "@testing-library/jest-dom"
import { render, screen, fireEvent } from "@testing-library/react"
import { Bill } from "components/db"
import { BillDetails } from "components/bill/BillDetails"
import { Timestamp } from "firebase/firestore"
import { Provider } from "react-redux"
import { thunk } from "redux-thunk" // Import redux-thunk
import configureStore from "redux-mock-store"
import { useState } from "react"
import { usePanelStatus } from "components/publish/hooks"

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

// mocking feature flags to match dev environment
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

// set up Redux mock store with thunk middleware bc resolveBill is thunk
const mockStore = configureStore([thunk])

describe('BillDetails', () => {

  let store: ReturnType<typeof mockStore>;
  beforeEach(() => {
    store = mockStore({
      auth: {
        authenticated: false,
        user: null,
        claims: null,
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
      },
    });

    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    );
  });

  it('renders a link with the bill number as the link text and links to the appropriate bill', () => {
      const linkElement = screen.getByRole('link', { name: mockBill.id[0] + '.' + mockBill.id.slice(1)});
      expect(linkElement).toHaveAttribute('href', `https://malegislature.gov/Bills/193/${mockBill.id}`);    
  });

  it("renders the Bill Status button with the last Action showing as text", ()=>{
    const buttonElement = screen.getByRole('button', { name: mockBill.history[mockBill.history.length-1].Action});
    expect(buttonElement).toBeInTheDocument();
  });

  it("renders the summary title and Read More button",()=>{
    const summaryTitle = screen.getByText(mockBill.content.Title) 
    const buttonElement = screen.getByRole('button', { name: "Read more.."});
    expect(summaryTitle).toBeInTheDocument
    expect(buttonElement).toBeInTheDocument
  })

  





  
});