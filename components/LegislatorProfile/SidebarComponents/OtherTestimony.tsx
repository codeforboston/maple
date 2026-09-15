import { useMemo } from "react"
import { useTranslation } from "next-i18next"
import { DateTime } from "luxon"
import { InstantSearch, useConfigure, useHits, useInstantSearch } from "react-instantsearch"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"

import { Spinner } from "components/bootstrap"
import { formatBillId, truncateText } from "components/formatting"
import { Internal, maple } from "components/links"
import { getServerConfig } from "components/search/common"
import { testimonySearchParams } from "components/search/searchParams"
import { SidebarBlock, SidebarTitle } from "../LegislatorSidebar"

const TestimonyBlock = styled.div`
  border-bottom: 1px solid #b8c0c9;
  font-size: 12px;
  margin: 0 2px;
  padding: 8px 0;

  &:last-child {
    border-bottom: none;
  }
`

const TestimonyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
`

const BillLink = styled(Internal)`
  font-weight: 700;
  color: #1a3185;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const AuthorLine = styled.div`
  color: #6c757d;
  font-size: 11px;
  margin-bottom: 4px;
`

const PositionBadge = styled.span<{ position?: string }>`
  font-size: 10px;
  font-weight: 600;
  text-transform: capitalize;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: ${props =>
    props.position === "endorse"
      ? "#e8f5e9"
      : props.position === "oppose"
      ? "#ffebee"
      : "#f5f5f5"};
  color: ${props =>
    props.position === "endorse"
      ? "#2e7d32"
      : props.position === "oppose"
      ? "#c62828"
      : "#616161"};
`

const ContentSnippet = styled.div`
  color: #212529;
  font-size: 11px;
  line-height: 1.4;
`

const DateLine = styled.div`
  color: #8c959f;
  font-size: 10px;
  margin-top: 4px;
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

  const isLoading = status === "loading" || status === "stalled" || !results._state

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
        {t("noOtherTestimony", {
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
            <TestimonyHeader>
              <BillLink
                href={maple.bill({
                  court: hit.court ?? court,
                  id: hit.billId
                })}
              >
                {formatBillId(hit.billId)}
              </BillLink>
              {hit.position && (
                <PositionBadge position={hit.position}>
                  {hit.position}
                </PositionBadge>
              )}
            </TestimonyHeader>
            <AuthorLine>
              {hit.authorDisplayName || "Anonymous"}
            </AuthorLine>
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
            {publishedDate && <DateLine>{publishedDate}</DateLine>}
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
          {t("noOtherTestimony", {
            defaultValue: "No testimony found for this legislator's bills."
          })}
        </div>
      ) : (
        <InstantSearch
          indexName="publishedTestimony/sort/publishedAt:desc"
          searchClient={searchClient}
        >
          <ConfigureParams court={courtNumber} billIds={billIds} />
          <TestimonyList court={courtNumber} />
        </InstantSearch>
      )}
    </SidebarBlock>
  )
}
