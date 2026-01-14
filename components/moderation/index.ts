export * from "./types"
export * from "./ListPublishedTestimony"
export * from "./ListReports"
export * from "./EditReports"
export * from "./ListProfiles"
export * from "./ScrapeHearing"

import dynamic from "next/dynamic"

export const App = dynamic(() => import("components/moderation/moderation"), {
  ssr: false
})
