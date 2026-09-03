import { useTranslation } from "next-i18next"
import styled from "styled-components"

import { Col } from "../../bootstrap"
import { SidebarBlock, SidebarLink, SidebarTitle } from "../LegislatorSidebar"

import { usePublishedTestimonyListing } from "components/db"

const TestimonyBlock = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 6px;
`

/* Position Components */

const EndorseBubble = styled.div.attrs(props => ({
  className: `${props.className}`
}))`
  background: #d4edda;
  color: #155724;

  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  margin-bottom: 4px;
  display: inline-block;
`

const NeutralBubble = styled.div.attrs(props => ({
  className: `${props.className}`
}))`
  background: #d1d6e7;
  color: #1a3185;

  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  margin-bottom: 4px;
  display: inline-block;
`

const OpposeBubble = styled.div.attrs(props => ({
  className: `${props.className}`
}))`
  background: #f4d2d6;
  color: #8b0000;

  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  margin-bottom: 4px;
  display: inline-block;
`

function PositionButton(props: { position: string }) {
  const { t } = useTranslation("legislators")

  switch (props.position) {
    case "endorse":
      return <EndorseBubble>{t("position.endorse")}</EndorseBubble>
    case "oppose":
      return <OpposeBubble>{t("position.oppose")}</OpposeBubble>
    default:
      return <NeutralBubble>{t("position.neutral")}</NeutralBubble>
  }
}

/* Misc Testimony Components */

const TestimonyBorder = styled.div`
  border-bottom: 1px solid #b8c0c9;
`

const TestimonyMeta = styled.div`
  color: #6c757d;
  font-size: 10px;
`

const TestimonyText = styled.div`
  color: #495057;
  line-height: 1.5;
  font-size: 12px;
  font-style: italic;
  margin-bottom: 3px;
`

export function OtherTestimony({
  court,
  sponsoredBills
}: {
  court: number
  sponsoredBills: any[]
}) {
  const { t } = useTranslation("legislators")

  const testimonyOnLegislatorBills: any[] = []

  sponsoredBills.forEach(bill => {
    const data = usePublishedTestimonyListing({
      billId: bill,
      court: court
    })

    data.items.result?.length
      ? testimonyOnLegislatorBills.push(
          ...data.items.result
            .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
            .slice(0, 3)
        )
      : null
  })

  testimonyOnLegislatorBills
    .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
    .slice(0, 3)

  /* formatted Testimony On Legislator Bills */
  const formattedTOLB = testimonyOnLegislatorBills.map(obj => {
    const date = new Date(obj.updatedAt.toMillis())

    const monthYear = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    })

    return {
      ...obj,
      formattedDate: monthYear
    }
  })

  return (
    <SidebarBlock className="mb-2">
      <SidebarTitle className={`my-1`}>{t("otherTestimony")}</SidebarTitle>
      {formattedTOLB ? (
        <>
          {formattedTOLB.map(t => (
            <TestimonyBlock key={t.id}>
              <PositionButton position={t.position} />
              <TestimonyText>{t.content}</TestimonyText>
              <TestimonyMeta>
                {t.authorDisplayName} {" · "} {t.billId} {" · "}
                {t.formattedDate}
              </TestimonyMeta>
            </TestimonyBlock>
          ))}
        </>
      ) : (
        <div>{t("noTestimony")}</div>
      )}
      <Col>
        <TestimonyBorder />
        <SidebarLink href="/testimony">
          {t("viewAllTestimony")}
          {" ↗"}
        </SidebarLink>
      </Col>
    </SidebarBlock>
  )
}
