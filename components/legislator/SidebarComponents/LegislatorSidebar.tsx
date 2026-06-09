import { Biography } from "./Biography"
import { OtherTestimony } from "./OtherTestimony"
import { UpcomingHearings } from "./UpcomingHearings"

export function LegislatorSidebar({ pageId }: { pageId: string }) {
  return (
    <>
      Sidebar Components
      <OtherTestimony />
      <UpcomingHearings />
      <Biography pageId={pageId} />
    </>
  )
}
