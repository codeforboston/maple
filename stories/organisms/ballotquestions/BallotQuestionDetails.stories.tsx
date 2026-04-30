import type { Meta, StoryObj } from "@storybook/react"
import Router, { NextRouter } from "next/router"
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime"
import { Provider as Redux } from "react-redux"
import { BallotQuestionHeader } from "components/ballotquestions/BallotQuestionHeader"
import { BallotQuestionNav } from "components/ballotquestions/BallotQuestionNav"
import { CampaignFinancialsTab } from "components/ballotquestions/CampaignFinancialsTab"
import { CommitteeHearing } from "components/ballotquestions/CommitteeHearing"
import { DescriptionBox } from "components/ballotquestions/DescriptionBox"
import { ForAndAgainstTab } from "components/ballotquestions/ForAndAgainstTab"
import { OverviewTab } from "components/ballotquestions/OverviewTab"
import { SynthesisTab } from "components/ballotquestions/SynthesisTab"
import { TestimoniesTab } from "components/ballotquestions/TestimoniesTab"
import { BallotQuestionTab } from "components/ballotquestions/types"
import {
  BallotQuestion,
  Bill,
  UsePublishedTestimonyListing
} from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { useState } from "react"

const ensureRouter = () => {
  if (Router.router) {
    return Router.router as unknown as NextRouter
  }

  const mockRouter = {
    basePath: "",
    pathname: "/ballotQuestions/[id]",
    route: "/ballotQuestions/[id]",
    query: {},
    asPath: "/ballotQuestions/25-12",
    push: async () => true,
    replace: async () => true,
    reload: () => {},
    back: () => {},
    forward: () => {},
    prefetch: async () => undefined,
    beforePopState: () => null,
    events: {
      on: () => {},
      off: () => {},
      emit: () => {}
    },
    isFallback: false,
    isLocaleDomain: false,
    isPreview: false,
    isReady: true,
    locale: "en",
    locales: ["en"],
    defaultLocale: "en",
    domainLocales: []
  } as unknown as NextRouter

  if (!Router.events) {
    ;(Router as any).events = {
      on: () => {},
      off: () => {},
      emit: () => {}
    }
  }

  ;(Router as any).router = mockRouter
  return mockRouter
}

const sampleBallotQuestion: BallotQuestion = {
  id: "25-12",
  billId: "H1234",
  court: 194,
  electionYear: 2026,
  type: "initiative_statute",
  ballotStatus: "accepted",
  ballotQuestionNumber: 2,
  relatedBillIds: ["H1234"],
  title: "Worker Benefits and Independent Contractor Standards",
  description:
    "This proposed law would establish standards for certain app-based drivers and create portable benefits funded through company contributions.",
  atAGlance: [
    {
      label: "Topic",
      value: "Labor and employment"
    },
    {
      label: "Filing year",
      value: "2025"
    }
  ],
  voteEffectYes:
    "A YES vote would create a new benefits framework for covered workers.",
  voteEffectNo:
    "A NO vote would make no change to existing independent contractor rules.",
  fiscalConsequences:
    "The measure may increase state administrative costs related to oversight and reporting.",
  inFavor:
    "**Supporters argue** the proposal would provide workers with flexible benefits while preserving independent schedules.\n\nThey say the measure would create a practical path to benefits for workers who currently fall outside traditional employment systems. Learn more from the [supporting committee](https://example.com/support).",
  against:
    "**Opponents argue** the proposal would create a separate standard for app-based workers.\n\nThey say workers should receive the same protections as other employees instead of a new category written for one industry.",
  supportCommittee: "Committee for Portable Benefits",
  opposeCommittee: "Coalition for Worker Classification Standards",
  campaignFinancials: {
    support: [{ cashRaised: 125000, spent: 40000, inKind: 5000 }],
    oppose: [{ cashRaised: 85000, spent: 25000, inKind: 2500 }]
  },
  fullSummary:
    "This proposed law would establish new requirements for certain transportation network and delivery network companies.\n\nThe proposal would require covered companies to make benefits contributions and provide disclosures to covered workers.",
  pdfUrl: "https://www.sec.state.ma.us/",
  testimonyCount: 18,
  endorseCount: 10,
  neutralCount: 3,
  opposeCount: 5
}

const sampleBill: Bill = {
  id: "H1234",
  court: 194,
  content: {
    Title: "An Act relative to worker benefits",
    BillNumber: "H1234",
    DocketNumber: "HD5678",
    GeneralCourtNumber: 194,
    Cosponsors: [],
    LegislationTypeName: "Bill",
    Pinslip: ""
  },
  cosponsorCount: 0,
  testimonyCount: 18,
  endorseCount: 10,
  opposeCount: 5,
  neutralCount: 3,
  fetchedAt: {} as Bill["fetchedAt"],
  history: {} as Bill["history"],
  hearingIds: ["hearing-101"]
}

const sampleHearing = {
  id: "hearing-101",
  startsAt: new Date("2026-03-12T10:00:00-05:00").getTime(),
  videoURL: "https://malegislature.gov/"
}

const emptyTestimonyListing: UsePublishedTestimonyListing = {
  items: {
    status: "success",
    loading: false,
    error: undefined,
    result: []
  } as unknown as UsePublishedTestimonyListing["items"],
  pagination: {
    itemsPerPage: 10,
    currentPage: 1,
    nextPage: () => {},
    previousPage: () => {},
    hasNextPage: false,
    hasPreviousPage: false
  },
  setFilter: () => {}
}

const meta: Meta = {
  title: "Organisms/BallotQuestions/Details",
  decorators: [
    (Story, ...rest) => {
      const router = ensureRouter()
      const { store } = wrapper.useWrappedStore(...rest)

      return (
        <RouterContext.Provider value={router}>
          <Redux store={store}>
            <Providers>
              <Story />
            </Providers>
          </Redux>
        </RouterContext.Provider>
      )
    }
  ]
}

export default meta

type Story = StoryObj

export const Header: Story = {
  render: () => (
    <BallotQuestionHeader
      ballotQuestion={sampleBallotQuestion}
      bill={sampleBill}
    />
  )
}

export const Navigation: Story = {
  render: function NavigationStory() {
    const [activeTab, setActiveTab] = useState<BallotQuestionTab>("overview")
    return (
      <div style={{ maxWidth: "20rem" }}>
        <BallotQuestionNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          testimonyCount={sampleBallotQuestion.testimonyCount}
          showCampaignFinancials
          showForAndAgainst
        />
      </div>
    )
  }
}

export const Overview: Story = {
  render: () => (
    <OverviewTab
      ballotQuestion={sampleBallotQuestion}
      bill={sampleBill}
      hearings={[sampleHearing]}
    />
  )
}

export const Testimonies: Story = {
  render: () => (
    <TestimoniesTab
      ballotQuestion={sampleBallotQuestion}
      bill={sampleBill}
      testimony={emptyTestimonyListing}
      testimonySummary={{
        testimonyCount: sampleBallotQuestion.testimonyCount,
        endorseCount: sampleBallotQuestion.endorseCount,
        neutralCount: sampleBallotQuestion.neutralCount,
        opposeCount: sampleBallotQuestion.opposeCount
      }}
    />
  )
}

export const ForAndAgainst: Story = {
  render: () => <ForAndAgainstTab ballotQuestion={sampleBallotQuestion} />
}

export const CampaignFinancials: Story = {
  render: () => <CampaignFinancialsTab ballotQuestion={sampleBallotQuestion} />
}

export const Synthesis: Story = {
  render: () => <SynthesisTab ballotQuestion={sampleBallotQuestion} />
}

export const Description: Story = {
  render: () => (
    <DescriptionBox description={sampleBallotQuestion.description ?? ""} />
  )
}

export const Hearing: Story = {
  render: () => <CommitteeHearing hearing={sampleHearing} />
}
