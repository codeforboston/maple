import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Bill, draftAttachment } from "components/db"
import { BillDetails } from "components/bill/BillDetails"
import { Timestamp } from "firebase/firestore"
import { Provider } from "react-redux"
import { thunk } from "redux-thunk" 
import configureStore from "redux-mock-store" 

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


// below test assumes mockBill contains a primary sponsor
  it("renders Sponsors",()=>{
    const primary = mockBill.content?.PrimarySponsor
    const cosponsors = mockBill.content.Cosponsors.filter(s => s.Id !== primary?.Id)

    const sponsorsHeading = screen.getByText("Sponsors")
    const leadSponsorImg = screen.getByRole('img',{name: "Lead Sponsor image"})
    const leadSponsorLink = screen.getByRole('link', { name: primary?.Name});
    
    expect(sponsorsHeading).toBeInTheDocument
    expect(leadSponsorImg).toBeInTheDocument
    expect(leadSponsorLink).toBeInTheDocument

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

  it("renders testimony section headings and subheadings", ()=>{
    const testimoniesHeading = screen.getByText("Testimonies")
    const allTestimonies = screen.getAllByText("All Testimonies")
    const individuals = screen.getAllByText("Individuals")
    const organizations = screen.getAllByText("Organizations")
    expect(testimoniesHeading).toBeInTheDocument
    expect(allTestimonies).toBeInTheDocument
    expect(individuals).toBeInTheDocument
    expect(organizations).toBeInTheDocument
  })

});

describe("Bill Details Testimony States",()=>{
  const firebaseUser = {
    uid: "user123",
    email: "user@example.com",
    emailVerified: true,
  };

  const unverifiedUser = {
    uid: "user123",
  }

  // Mock Testimony object
  const mockTestimonyPublication = {
  id: "testimony123",
  billId: "bill123",
  court: 1,
  position: "endorse",
  content: "This is a sample testimony content that is less than 10,000 characters.",
  attachmentId: null,
  editReason: null,
  authorUid: "user123",
  authorDisplayName: "John Doe",
  authorRole: "user", // Assuming Role.User is defined in your Role enum
  billTitle: "Sample Bill Title",
  version: 1,
  publishedAt: Timestamp.fromMillis(Date.now()),
  representativeId: null,
  senatorId: null,
  senatorDistrict: null,
  representativeDistrict: null,
  draftAttachmentId: null,
  fullName: "John Doe"
}

const mockTestimonyDraft = {
  position: "endorse",
  content: "This is a sample testimony content that is less than 10,000 characters.",
  draftAttachmentId: null,
}


  let store: ReturnType<typeof mockStore>;

  it("renders appropriate testimony panel state when user is not logged in",()=>{
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
        draft: {},
        sync: "synced",
      },
    });
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: "logInSignUp"});
    const signInPrompt = screen.getByText("Sign In to Add Testimony")
    expect(loginButton).toBeInTheDocument
    expect(signInPrompt).toBeInTheDocument
  })

  it("renders appropriate testimony panel state when user has unverified email",()=>{
    store = mockStore({
      auth: {
        authenticated: true,
        user: unverifiedUser,
        claims: null,
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        sync: "synced",
      },
    });
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    );

    const verifyButton = screen.getByRole('button', { name: "Verify Your Email"});
    expect(verifyButton).toBeInTheDocument
  })

  it("renders appropriate testimony panel state when user has unverified email",()=>{
    store = mockStore({
      auth: {
        authenticated: true,
        user: unverifiedUser,
        claims: null,
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        sync: "synced",
      },
    });
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    );

    const verifyButton = screen.getByRole('button', { name: "Verify Your Email"});
    expect(verifyButton).toBeInTheDocument
  })

  it("renders appropriate testimony panel state when user is logged in and does NOT have a testimony draft",()=>{
    store = mockStore({
      auth: {
        authenticated: true,
        user: firebaseUser,
        claims: null,
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        sync: "synced",
      },
    });
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    );

    const createTestimonyPrompt = screen.getByText("You Haven't Submitted Testimony")
    const createTestimonyButton = screen.getByRole('button', { name: "Create Testimony"});
    expect(createTestimonyButton).toBeInTheDocument
    expect(createTestimonyPrompt).toBeInTheDocument
    
  })

  it("renders appropriate testimony panel state when user is logged in and has a testimony draft",()=>{
    store = mockStore({
      auth: {
        authenticated: true,
        user: firebaseUser,
        claims: null,
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        draft: mockTestimonyDraft,
        sync: "synced",
      },
    });
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    );

    const completeTestimonyPrompt = screen.getByText("You Have Draft Testimony")
    const completeTestimonyButton = screen.getByRole('button', { name: "Complete Testimony"});
    expect(completeTestimonyButton).toBeInTheDocument
    expect(completeTestimonyPrompt).toBeInTheDocument
  })


  // made below test async bc of async updating that is likely related to the testimony preview subcomponent 
  it("renders appropriate testimony panel state when user has a submitted testimony",async ()=>{
    store = mockStore({
      auth: {
        authenticated: true,
        user: firebaseUser,
        claims: null,
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        draft: mockTestimonyDraft,
        sync: "synced",
        publication: mockTestimonyPublication,
      },
    });
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Your Testimony")).toBeInTheDocument();
    });
    const editTestimonyButton = screen.getByRole("button", { name: "edit testimony" });
    const emailButton = screen.getByRole("button", { name: "Email Your Published Testimony" });
    const twitterShareLinkButton = screen.getByRole("button", { name: "link.twitter" });

    expect(editTestimonyButton).toBeInTheDocument();
    expect(twitterShareLinkButton).toBeInTheDocument();
    expect(emailButton).toBeInTheDocument();

  })


})

