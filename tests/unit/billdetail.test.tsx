import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Bill } from "common/bills/types"
import { BillDetails } from "components/bill/BillDetails"
import { Timestamp } from "common/types"
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
  id: "A1234",
  court: 193,
  content: {
    BillNumber: "A1234",
    PrimarySponsor: {
      Name: "Primary Sponsor",
      Id: "ABC1",
      Type: 1
    },
    DocketNumber: "AB1234",
    Title: "Content Title",
    DocumentText: "Document Text",
    LegislationTypeName: "Bill",
    Pinslip: "Pinslip",
    Cosponsors: [
      {
        Type: 1,
        Id: "ABC1",
        Name: "Primary Sponsor"
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
      }
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
  latestTestimonyId: "Xy7dkT90nmLVac56pq_ZW",
  fetchedAt: new Timestamp(1718811579, 935000000),
  history: [
    {
      Action: "History Action 1",
      Branch: "Senate",
      Date: "2023-02-16T11:17:15.563"
    },
    {
      Branch: "House",
      Date: "2023-02-16T11:17:15.563",
      Action: "History Action 2"
    },
    {
      Date: "2023-03-29T16:13:01.983",
      Action: "History Action 3",
      Branch: "Joint"
    },
    {
      Action: "Last History Action",
      Date: "2023-07-13T00:00:00",
      Branch: "Senate"
    }
  ],
  city: "Sample City",
  similar: []
}

// set up Redux mock store with thunk middleware bc resolveBill is thunk
const mockStore = configureStore([thunk])

describe("BillDetails", () => {
  let store: ReturnType<typeof mockStore>
  const { id, content, history, cosponsorCount } = mockBill
  const { Title, DocumentText, PrimarySponsor, Cosponsors } = content
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

  it("renders a link with the bill number as the link text and links to the appropriate bill", () => {
    const title = screen.getByRole("link", {
      name: id[0] + "." + id.slice(1)
    })
    expect(title).toHaveAttribute(
      "href",
      `https://malegislature.gov/Bills/193/${id}`
    )
  })

  it("renders the Bill Status button with the last Action when mockBill has history", () => {
    const statusButton = screen.getByRole("button", {
      name: history[history.length - 1].Action
    })
    expect(statusButton).toBeInTheDocument()
  })

  it("renders the summary and full text", () => {
    expect(screen.getByText(Title)).toBeInTheDocument
    const readMoreButton = screen.getByRole("button", { name: "Read more.." })
    expect(readMoreButton).toBeInTheDocument
    fireEvent.click(readMoreButton)
    expect(screen.getByText(DocumentText ?? "")).toBeInTheDocument()
  })

  // below test assumes mockBill contains a primary sponsor
  it("renders Sponsors", () => {
    const cosponsors = Cosponsors.filter(s => s.Id !== PrimarySponsor?.Id)

    expect(screen.getByText("Sponsors")).toBeInTheDocument
    expect(screen.getByRole("img", { name: "Lead Sponsor image" }))
      .toBeInTheDocument
    const leadSponsorLink = screen.getByRole("link", {
      name: PrimarySponsor?.Name
    })
    expect(leadSponsorLink).toBeInTheDocument

    // if the mockBill has cosponsors (excluding primary), then atleast one cosponsor image and link should show
    if (cosponsors.length > 0) {
      const cosponsorImgs = screen.getAllByRole("img", {
        name: "Sponsor image"
      })
      const cosponsorLinks = screen.getAllByRole("link", {
        name: cosponsors[0].Name
      })
      expect(cosponsorImgs[0]).toBeInTheDocument
      expect(cosponsorLinks[0]).toBeInTheDocument
    }

    // expect the 'See X Sponsors' button if there are more than two cosponsors (excluding primary)
    if (cosponsors.length > 2) {
      expect(
        screen.getByRole("button", {
          name: `See ${cosponsorCount} Sponsors`
        })
      ).toBeInTheDocument
    }
  })

  it("renders testimony section headings and subheadings", () => {
    const headings = [
      "Testimonies",
      "All Testimonies",
      "Individuals",
      "Organizations"
    ]
    headings.forEach(heading => {
      expect(screen.getByText(heading)).toBeInTheDocument()
    })
  })
})

describe("Bill Details Testimony States", () => {
  const firebaseUser = {
    uid: "user123",
    email: "user@example.com",
    emailVerified: true
  }

  const unverifiedUser = {
    uid: "user123"
  }

  // Mock Testimony object
  const mockTestimonyPublication = {
    id: "testimony123",
    billId: "bill123",
    court: 1,
    position: "endorse",
    content:
      "This is a sample testimony content that is less than 10,000 characters.",
    attachmentId: null,
    editReason: null,
    authorUid: "user123",
    authorDisplayName: "John Doe",
    authorRole: "user",
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
    content:
      "This is a sample testimony content that is less than 10,000 characters.",
    draftAttachmentId: null
  }

  let store: ReturnType<typeof mockStore>

  it("renders appropriate testimony panel state when user is not logged in", () => {
    store = mockStore({
      auth: {
        authenticated: false,
        user: null,
        claims: null
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        draft: {},
        sync: "synced"
      }
    })
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    )
    expect(screen.getByText("Sign In to Add Testimony")).toBeInTheDocument
    expect(screen.getByRole("button", { name: "logInSignUp" }))
      .toBeInTheDocument
  })

  it("renders appropriate testimony panel state when user has unverified email", () => {
    store = mockStore({
      auth: {
        authenticated: true,
        user: unverifiedUser,
        claims: null
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        sync: "synced"
      }
    })
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    )

    expect(
      screen.getByRole("button", {
        name: "Verify Your Email"
      })
    ).toBeInTheDocument
  })

  it("renders appropriate testimony panel state when user is logged in and does NOT have a testimony draft", () => {
    store = mockStore({
      auth: {
        authenticated: true,
        user: firebaseUser,
        claims: null
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        sync: "synced"
      }
    })
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    )

    expect(screen.getByText("You Haven't Submitted Testimony"))
      .toBeInTheDocument
    expect(screen.getByRole("button", { name: "Create Testimony" }))
      .toBeInTheDocument
  })

  it("renders appropriate testimony panel state when user is logged in and has a testimony draft", () => {
    store = mockStore({
      auth: {
        authenticated: true,
        user: firebaseUser,
        claims: null
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        draft: mockTestimonyDraft,
        sync: "synced"
      }
    })
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    )

    expect(screen.getByText("You Have Draft Testimony")).toBeInTheDocument
    expect(screen.getByRole("button", { name: "Complete Testimony" }))
      .toBeInTheDocument
  })

  // made below test async bc of async updating that is likely related to the testimony preview subcomponent
  it("renders appropriate testimony panel state when user has a submitted testimony", async () => {
    store = mockStore({
      auth: {
        authenticated: true,
        user: firebaseUser,
        claims: null
      },
      publish: {
        service: {},
        showThankYou: false,
        bill: mockBill,
        draft: mockTestimonyDraft,
        sync: "synced",
        publication: mockTestimonyPublication
      }
    })
    render(
      <Provider store={store}>
        <BillDetails bill={mockBill} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText("Your Testimony")).toBeInTheDocument()
    })
    const editTestimonyButton = screen.getByRole("button", {
      name: "edit testimony"
    })
    const emailButton = screen.getByRole("button", {
      name: "Email Your Published Testimony"
    })
    const twitterShareLinkButton = screen.getByRole("button", {
      name: "link.twitter"
    })

    expect(editTestimonyButton).toBeInTheDocument()
    expect(twitterShareLinkButton).toBeInTheDocument()
    expect(emailButton).toBeInTheDocument()
  })
})
