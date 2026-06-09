import { Biography } from "./Biography"
import { OtherTestimony } from "./OtherTestimony"
import { UpcomingHearings } from "./UpcomingHearings"
import { Profile } from "../../db"

export function LegislatorSidebar({
  pageId,
  publicProfile
}: {
  pageId: string
  publicProfile: Profile | undefined
}) {
  return (
    <>
      Sidebar Components
      <OtherTestimony />
      <UpcomingHearings />
      <Biography pageId={pageId} publicProfile={publicProfile} />
    </>
  )
}
