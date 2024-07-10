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
      "SECTION 1. The chief of police of the town of Charlton may appoint, if the chief deems necessary, individuals with a law enforcement background as special police officers...",
    LegislationTypeName: "Bill",
    Pinslip:
      "By Mr. Fattman, a petition (accompanied by bill, Senate, No. 1653) of Ryan C. Fattman (by vote of the town) for legislation to authorize the appointment of special police officers in the town of Charlton.  Public Service.  [Local Approval Received.]",
    Cosponsors: [
      {
        Type: 1,
        Id: "RCF0",
        Name: "Ryan C. Fattman"
      },
      {
        Type: 1,
        Id: "AAAA",
        Name: "Second Sponsor"
      },
      {
        Type: 1,
        Id: "BBBB",
        Name: "Third Sponsor"
      },
      {
        Type: 1,
        Id: "CCCC",
        Name: "Fourth Sponsor"
      },

    ],
    GeneralCourtNumber: 193
  },
  cosponsorCount: 4,
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
      const title = screen.getByRole('link', { name: mockBill.id[0] + '.' + mockBill.id.slice(1)});
      expect(title).toHaveAttribute('href', `https://malegislature.gov/Bills/193/${mockBill.id}`);   
  });

  it("renders the Bill Status button with the last Action when mockBill has history", ()=>{
    const statusButton = screen.getByRole('button', { name: mockBill.history[mockBill.history.length-1].Action});
    expect(statusButton).toBeInTheDocument();
  });


  it("renders the summary and full text",()=>{
    const summaryTitle = screen.getByText(mockBill.content.Title) 
    const readMoreButton = screen.getByRole('button', { name: "Read more.."});
    expect(summaryTitle).toBeInTheDocument
    expect(readMoreButton).toBeInTheDocument
    fireEvent.click(readMoreButton)
    const fullText = screen.getByText(mockBill.content.DocumentText)
    expect(fullText).toBeInTheDocument
  })

  it("renders Sponsors",()=>{
    const primary = mockBill.content?.PrimarySponsor
    const cosponsors = mockBill.content.Cosponsors.filter(s => s.Id !== primary?.Id)

    const sponsorsHeading = screen.getByText("Sponsors")
    const leadSponsorImg = screen.getByRole('img',{name: "Lead Sponsor image"})
    
    expect(sponsorsHeading).toBeInTheDocument
    expect(leadSponsorImg).toBeInTheDocument

    // if the mockBill has cosponsors (excluding primary), then atleast one cosponsor image and link should show
    if (cosponsors.length > 0){
      const cosponsorImgs = screen.getAllByRole('img',{name: "Sponsor image"})
      const cosponsorLinks = screen.getAllByRole('link', { name: cosponsors[0].Name});
      expect(cosponsorImgs[0]).toBeInTheDocument
      expect(cosponsorLinks[0]).toBeInTheDocument
    }

    // expect the 'See X Sponsors' button if there are more than two cosponsors (excluding primary)
    if (cosponsors.length > 2){
      const seeSponsorsButton = screen.getByRole('button', { name: `See ${mockBill.cosponsorCount} Sponsors`});
      expect(seeSponsorsButton).toBeInTheDocument
    }
  })

});

// also check for the link presense and maybe also that the modal with other sponsors in the list opens up?