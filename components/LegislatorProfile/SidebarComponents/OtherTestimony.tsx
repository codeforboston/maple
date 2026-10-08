import { DateTime } from "luxon"
import { useTranslation } from "next-i18next"
import { useMemo } from "react"
import {
  InstantSearch,
  useConfigure,
  useHits,
  useInstantSearch
} from "react-instantsearch"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"

import { Col } from "../../bootstrap"
import { SidebarBlock, SidebarLink, SidebarTitle } from "../LegislatorSidebar"

import { Spinner } from "components/bootstrap"
import { formatBillId, truncateText } from "components/formatting"
import { Internal, maple } from "components/links"
import { getServerConfig } from "components/search/common"
import { testimonySearchParams } from "components/search/searchParams"

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

const BillLink = styled(Internal)`
  font-weight: 700;
  color: #1a3185;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const ContentSnippet = styled.div`
  color: #212529;
  font-size: 11px;
  line-height: 1.4;
`

const DateLine = styled.span`
  whitespace: "nowrap";
`

const Interpunct = styled.span`
  color: #3b3b3b;
  font-weight: 700;
`

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

type TestimonyHitRecord = {
  id: string
  billId: string
  court: number
  position: "endorse" | "oppose" | "neutral"
  content: string
  authorDisplayName: string
  publishedAt: number
}

function ConfigureParams({
  court,
  billIds
}: {
  court: number
  billIds: string[]
}) {
  const configure = {
    hitsPerPage: 3,
    filters: `court:=${court} && billId:=[${billIds.join(",")}]`
  } as any
  useConfigure(configure)
  return null
}

function TestimonyList({ court }: { court: number }) {
  const { t } = useTranslation(["legislators", "testimony"])
  const { hits } = useHits<TestimonyHitRecord>()
  const { status, results } = useInstantSearch()

  const isLoading =
    status === "loading" || status === "stalled" || !results._state

  if (isLoading && hits.length === 0) {
    return (
      <div className="py-3 text-center text-muted">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>{t("loading", { defaultValue: "Loading testimony..." })}</span>
      </div>
    )
  }

  if (hits.length === 0) {
    return (
      <div className="py-2 text-muted">
        {t("noTestimony", {
          defaultValue: "No testimony found for this legislator's bills."
        })}
      </div>
    )
  }

  return (
    <div>
      {hits.map(hit => {
        const publishedDate = hit.publishedAt
          ? DateTime.fromMillis(hit.publishedAt).toLocaleString(
              DateTime.DATE_MED
            )
          : null

        return (
          <TestimonyBlock key={hit.id}>
            <PositionButton position={hit.position} />
            <TestimonyText>
              {hit.content && (
                <ContentSnippet>
                  <Internal
                    href={maple.testimony({ publishedId: hit.id })}
                    className="text-decoration-none text-dark"
                  >
                    {truncateText(hit.content, 120)}
                  </Internal>
                </ContentSnippet>
              )}
            </TestimonyText>
            <TestimonyMeta>
              {hit.authorDisplayName || "Anonymous"}
              <Interpunct>{" · "}</Interpunct>
              <BillLink
                href={maple.bill({
                  court: hit.court ?? court,
                  id: hit.billId
                })}
              >
                {formatBillId(hit.billId)}
              </BillLink>
              <Interpunct>{" · "}</Interpunct>
              <DateLine style={{ whiteSpace: "nowrap" }}>
                {publishedDate}
              </DateLine>
            </TestimonyMeta>
          </TestimonyBlock>
        )
      })}
    </div>
  )
}

export function OtherTestimony({
  court,
  sponsoredBills = []
}: {
  court?: number
  sponsoredBills?: string[]
}) {
  const { t } = useTranslation("legislators")

  const billIds = useMemo(() => {
    return Array.from(new Set(sponsoredBills))
  }, [sponsoredBills])

  const searchClient = useMemo(
    () =>
      new TypesenseInstantSearchAdapter({
        server: getServerConfig(),
        additionalSearchParameters: testimonySearchParams
      }).searchClient,
    []
  )

  const courtNumber = court ?? 193

  return (
    <SidebarBlock className="mb-2">
      <SidebarTitle className="my-1">{t("otherTestimony")}</SidebarTitle>
      {billIds.length === 0 ? (
        <div className="py-2 text-muted">
          {t("noTestimony", {
            defaultValue: "No testimony found for this legislator's bills."
          })}
        </div>
      ) : (
        <>
          <InstantSearch
            indexName="publishedTestimony/sort/publishedAt:desc"
            searchClient={searchClient}
          >
            <ConfigureParams court={courtNumber} billIds={billIds} />
            <TestimonyList court={courtNumber} />
          </InstantSearch>
          <Col>
            <TestimonyBorder />
            <SidebarLink href="/testimony">
              {t("viewAllTestimony")}
              {" ↗"}
            </SidebarLink>
          </Col>
        </>
      )}
    </SidebarBlock>
  )
}
