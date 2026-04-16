import { Hit } from "instantsearch.js"
import Link from "next/link"
import { Trans, useTranslation } from "next-i18next"
import { Card, Image } from "react-bootstrap"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"

import { useAuth } from "components/auth"
import { useBill } from "components/db/bills"
import { Testimony } from "components/db/testimony"
import { useFlags } from "components/featureFlags"
import { formatBillId, truncateText } from "components/formatting"
import { maple } from "components/links"
import { FollowUserButton } from "components/shared/FollowButton"
import { trimContent } from "components/TestimonyCallout/TestimonyCallout"

const StyledCard = styled(Card)`
  background: var(--maple-surface-gradient);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--bs-border-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  height: 100%;
  overflow: hidden;
  transition: transform var(--maple-transition-fast),
    box-shadow var(--maple-transition-fast),
    border-color var(--maple-transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--maple-shadow-hover);
    border-color: var(--maple-border-accent);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: var(--maple-space-sm);
    padding: var(--maple-space-lg);
    height: 100%;
  }
`

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--maple-space-sm);
`

const AuthorName = styled.span`
  flex-grow: 1;
  font-size: 0.875rem;
  font-weight: var(--maple-font-weight-semibold);
`

const PositionRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--maple-space-md);
`

const ThumbWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`

const ThumbIcon = styled.div<{ $position: string }>`
  background-image: url(thumbs-${({ $position }) => $position}.svg);
  height: 36px;
  width: 36px;
  background-size: cover;
`

const PositionLabel = styled.span`
  font-size: 0.7rem;
  color: var(--maple-text-muted);
  text-transform: capitalize;
`

const BillBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`

const BillId = styled.span`
  font-size: 0.8rem;
  font-weight: var(--maple-font-weight-semibold);
  color: var(--maple-text-strong);
`

const BillTitle = styled.p`
  font-size: 0.78rem;
  font-weight: var(--maple-font-weight-semibold);
  color: var(--maple-brand-primary);
  margin: 0;
  line-height: var(--maple-line-height-tight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Quote = styled.p`
  font-size: 0.8rem;
  color: var(--maple-text-body);
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  gap: var(--maple-space-sm);
  flex-wrap: wrap;
`

const DateLabel = styled.span`
  font-size: 0.75rem;
  color: var(--maple-text-muted);
  margin-left: auto;
`

const CommitteePill = styled.span`
  background: var(--bs-blue);
  border-radius: var(--maple-radius-pill);
  color: var(--maple-text-inverse);
  font-size: 0.7rem;
  padding: 3px var(--maple-space-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

export const TestimonyHit = ({ hit }: { hit: Hit<Testimony> }) => {
  const url = maple.testimony({ publishedId: hit.id })
  return (
    <Link href={url} legacyBehavior>
      <a style={{ all: "unset", cursor: "pointer" }} className="w-100">
        <TestimonyResult hit={hit} />
      </a>
    </Link>
  )
}

const TestimonyResult = ({ hit }: { hit: Hit<Testimony> }) => {
  const date = new Date(
    parseInt(hit.publishedAt.toString())
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
  const { loading, error, result: bill } = useBill(hit.court, hit.billId)
  const committee = bill?.currentCommittee
  const isOrg = hit.authorRole === "organization"
  const { user } = useAuth()
  const { followOrg } = useFlags()
  const isCurrentUser = user?.uid === hit.authorUid
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <StyledCard>
      <Card.Body>
        <AuthorRow>
          <Image
            src={
              isOrg ? "/profile-org-icon.svg" : "/profile-individual-icon.svg"
            }
            alt={useTranslation("auth").t("profileIcon")}
            height="28px"
            width="28px"
          />
          <AuthorName>
            <Trans
              ns="testimony"
              i18nKey="testimonyHit.writtenBy"
              values={{ author: hit.fullName }}
              components={[
                isOrg || hit.public ? (
                  <Link href={`/profile?id=${hit.authorUid}`} />
                ) : (
                  <></>
                )
              ]}
            />
          </AuthorName>
          {hit.public && !isCurrentUser && followOrg && user && (
            <FollowUserButton profileId={hit.authorUid} />
          )}
        </AuthorRow>

        <PositionRow>
          <ThumbWrap>
            <ThumbIcon $position={hit.position} />
            <PositionLabel>{hit.position}</PositionLabel>
          </ThumbWrap>
          <BillBlock>
            <BillId>
              {useTranslation("testimony").t("testimonyHit.bill", {
                billId: formatBillId(hit.billId)
              })}
            </BillId>
            <BillTitle>{bill?.content.Title}</BillTitle>
          </BillBlock>
        </PositionRow>

        <Quote>"{trimContent(hit.content, 220)}"</Quote>

        <FooterRow>
          {committee && (
            <CommitteePill>
              {isMobile ? truncateText(committee.name, 30) : truncateText(committee.name, 40)}
            </CommitteePill>
          )}
          <DateLabel>{date}</DateLabel>
        </FooterRow>
      </Card.Body>
    </StyledCard>
  )
}
