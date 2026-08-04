import { Biography } from "./SidebarComponents/Biography"
import { OtherTestimony } from "./SidebarComponents/OtherTestimony"
import { UpcomingHearings } from "./SidebarComponents/UpcomingHearings"

export function LegislatorSidebar({
  court,
  legislatorData,
  legislatorId,
  memberCode
}: {
  court: number
  legislatorData: any[]
  legislatorId: string
  memberCode: string
}) {
  return (
    <>
      <OtherTestimony />
      <UpcomingHearings />
      <Biography
        court={court}
        legislatorData={legislatorData}
        legislatorId={legislatorId}
        memberCode={memberCode}
      />
    </>
  )
}
