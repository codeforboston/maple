import styled from "styled-components"

import * as links from "../links"

import { Biography } from "./SidebarComponents/Biography"
import { OtherTestimony } from "./SidebarComponents/OtherTestimony"
import { UpcomingHearings } from "./SidebarComponents/UpcomingHearings"

export function LegislatorSidebar({
  committeeList,
  court,
  legislatorData,
  legislatorId,
  memberCode,
  sponsoredBills
}: {
  committeeList: any[]
  court: number
  legislatorData: any[]
  legislatorId: string
  memberCode: string
  sponsoredBills: any[]
}) {
  return (
    <>
      <OtherTestimony court={court} sponsoredBills={sponsoredBills} />
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

export const SidebarBlock = styled.div`
  background-color: white;
  border-color: #b8c0c9;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  font-size: 11px;
  padding: 16px;
`

export const SidebarLink = styled(links.Internal)`
  font-size: 12px;
  font-weight: 700;
  color: #1a3185;
  padding: 10px;
  display: block;
  text-align: center;
  text-decoration: none;
`

export const SidebarTitle = styled.div`
  font-weight: 700;
  color: #0b0a3e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
`
