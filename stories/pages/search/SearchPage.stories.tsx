import { Meta, StoryObj } from "@storybook/react"
import Router, { NextRouter } from "next/router"
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime"
import { HearingSearch as HearingSearchComponent } from "components/search/hearings/HearingSearch"
import { SearchPage } from "components/search/shared/SearchPage"
import {
  getDefaultHearingFacets,
  getDefaultHearingHits,
  setupMockInstantSearchAdapter
} from "stories/utils/mockInstantSearch"

const ensureRouter = () => {
  if (Router.router) {
    return Router.router as unknown as NextRouter
  }

  const mockRouter = {
    basePath: "",
    pathname: "/hearings",
    route: "/hearings",
    query: {},
    asPath: "/hearings",
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

setupMockInstantSearchAdapter({
  hits: getDefaultHearingHits(),
  facets: getDefaultHearingFacets()
})

const meta: Meta<typeof HearingSearchComponent> = {
  title: "Pages/Search/SearchPage",
  component: SearchPage,
  decorators: [
    Story => {
      const router = ensureRouter()
      return (
        <RouterContext.Provider value={router}>
          <Story />
        </RouterContext.Provider>
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof HearingSearchComponent>

export const HearingSearch: Story = {
  name: "Hearing Search",
  render: HearingSearchComponent
}
