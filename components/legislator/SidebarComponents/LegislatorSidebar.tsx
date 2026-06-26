import { Profile } from "../../db"
import { Biography } from "./Biography"
import { OtherTestimony } from "./OtherTestimony"
import { UpcomingHearings } from "./UpcomingHearings"

export function LegislatorSidebar({
  pageId,
  publicProfile
}: {
  pageId: string
  publicProfile: Profile | undefined
}) {
  return (
    <>
      <OtherTestimony />
      <UpcomingHearings />
      <Biography pageId={pageId} publicProfile={publicProfile} />
    </>
  )
}
