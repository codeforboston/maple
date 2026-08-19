import { Biography } from "./SidebarComponents/Biography"
import { OtherTestimony } from "./SidebarComponents/OtherTestimony"
import { UpcomingHearings } from "./SidebarComponents/UpcomingHearings"

export function LegislatorSidebar({
  committeeList,
  court,
  legislatorData,
  legislatorId,
  memberCode
}: {
  committeeList: any[]
  court: number
  legislatorData: any[]
  legislatorId: string
  memberCode: string
}) {
  return (
    <>
      <OtherTestimony />
      <UpcomingHearings committeeList={committeeList} />
      <Biography
        court={court}
        legislatorData={legislatorData}
        legislatorId={legislatorId}
        memberCode={memberCode}
      />
    </>
  )
}
