import { Meta, StoryObj } from "@storybook/react"
import { configureStore } from "@reduxjs/toolkit"
import { User } from "firebase/auth"
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime"
import { NextRouter } from "next/router"
import { Provider as Redux } from "react-redux"
import { reducer as auth } from "components/auth/redux"
import { api } from "components/db/api"
import { reducer as profile } from "components/db/profile/redux"
import { reducer as publish } from "components/publish/redux"
import { slice as testimonyDetail } from "components/testimony/TestimonyDetailPage"
import { ProfilePage } from "components/ProfilePage"

const PROFILE_UID = "mock-profile-uid"

const mockRouter = {
  basePath: "",
  pathname: "/profile/[id]",
  route: "/profile/[id]",
  query: { phoneVerificationUI: "enabled" },
  asPath: `/profile/${PROFILE_UID}`,
  push: async () => true,
  replace: async () => true,
  reload: () => {},
  back: () => {},
  forward: () => {},
  prefetch: async () => undefined,
  beforePopState: () => null,
  events: { on: () => {}, off: () => {}, emit: () => {} },
  isFallback: false,
  isLocaleDomain: false,
  isPreview: false,
  isReady: true,
  locale: "en",
  locales: ["en"],
  defaultLocale: "en",
  domainLocales: []
} as unknown as NextRouter

const createMockStore = (userUid: string, emailVerified: boolean) =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth,
      profile,
      publish,
      [testimonyDetail.name]: testimonyDetail.reducer
    },
    preloadedState: {
      auth: {
        user: { uid: userUid, emailVerified } as unknown as User,
        claims: { role: "user" as const },
        authenticated: true,
        authFlowStep: null,
        loading: false
      }
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware)
  })

const meta: Meta<typeof ProfilePage> = {
  title: "Pages/ProfilePage",
  component: ProfilePage
}

export default meta

type Story = StoryObj<typeof ProfilePage>

export const OwnProfile: Story = {
  render: () => (
    <RouterContext.Provider value={mockRouter}>
      <Redux store={createMockStore(PROFILE_UID, false)}>
        <ProfilePage id={PROFILE_UID} />
      </Redux>
    </RouterContext.Provider>
  ),
  name: "Own Profile"
}

export const AnothersProfile: Story = {
  render: () => (
    <RouterContext.Provider value={mockRouter}>
      <Redux store={createMockStore("mock-viewer-uid", false)}>
        <ProfilePage id={PROFILE_UID} />
      </Redux>
    </RouterContext.Provider>
  ),
  name: "Another's Profile"
}
