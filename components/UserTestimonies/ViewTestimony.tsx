import { formUrl } from "components/publish/hooks"
import { NoResults } from "components/search/NoResults"
import { formatTestimony } from "components/testimony"
import { ViewAttachment } from "components/ViewAttachment"
import { useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Form, Row } from "../bootstrap"
import {
  Testimony,
  useBill,
  usePublicProfile,
  UsePublishedTestimonyListing
} from "../db"
import { formatBillId } from "../formatting"
import { Internal, maple } from "../links"
import { TitledSectionCard } from "../shared"
import { PositionLabel } from "./PositionBug"

const ViewTestimony = (
  props: UsePublishedTestimonyListing & {
    search?: boolean
    showControls?: boolean
    showBillNumber?: boolean
    className?: string
  }
) => {
  const {
    pagination,
    items,
    setFilter,
    showControls = false,
    showBillNumber = false,
    className
  } = props
  const testimony = items.result ?? []

  const [orderBy, setOrderBy] = useState<string>()

  return (
    <TitledSectionCard
      title={"Testimony"}
      className={className}
      // bug={<SortTestimonyDropDown orderBy={orderBy} setOrderBy={setOrderBy} />}
    >
      {testimony.length > 0 ? (
        testimony.map(t => (
          <TestimonyItem
            key={t.authorUid + t.billId}
            testimony={t}
            showControls={showControls}
            showBillNumber={showBillNumber}
          />
        ))
      ) : (
        <NoResults>
          There is no testimony here. <br />
          <b>Be the first and add one!</b>
        </NoResults>
      )}
      <div className="p-3" />
      {/* <PaginationButtons pagination={pagination} /> */}
    </TitledSectionCard>
  )
}

export const SortTestimonyDropDown = ({
  orderBy,
  setOrderBy
}: {
  orderBy?: string
  setOrderBy: (order: string) => void
}) => {
  return (
    <Form.Select
      className="bg-white w-100"
      onChange={e => setOrderBy(e.target.value)}
    >
      <option value="Most Recent First">Most Recent First</option>
      <option value="Oldest First">Oldest First</option>
    </Form.Select>
  )
}

const Author = styled<{ testimony: Testimony }>(({ testimony, ...props }) => {
  const profile = usePublicProfile(testimony.authorUid)

  const authorName = profile.loading
    ? ""
    : profile.result?.fullName ?? testimony.authorDisplayName ?? "Anonymous"
  const linkToProfile = !!profile.result
  return (
    <div {...props}>
      {linkToProfile ? (
        <Internal href={`/profile?id=${testimony.authorUid}`}>
          {authorName}
        </Internal>
      ) : (
        authorName
      )}
    </div>
  )
})`
  font-weight: bold;
  .testimony-title {
    width: 60%;
  }

  @media (min-width: 768px) {
    .testimony-title {
      width: 100%;
    }
  }
`

export const TestimonyItem = ({
  testimony,
  showControls,
  showBillNumber
}: {
  testimony: Testimony
  showControls: boolean
  showBillNumber: boolean
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const published = testimony.publishedAt.toDate().toLocaleDateString()
  const billLink = maple.bill({
    id: testimony.billId,
    court: testimony.court
  })

  return (
    <div className={`bg-white border-0 border-bottom p-3 p-sm-4 p-md-5`}>
      <div className={`bg-white border-0 h5 d-flex`}>
        <Author testimony={testimony} className="flex-grow-1" />
        {isMobile && showControls && (
          <>
            <Internal href={formUrl(testimony.billId, testimony.court)}>
              <Image
                className="px-2 ms-auto align-self-center"
                src="/edit-testimony.svg"
                alt="Edit icon"
                height={50}
                width={50}
              />
            </Internal>

            <Internal href={billLink}>
              <Image
                className="px-2 align-self-center"
                src="/delete-testimony.svg"
                alt="Delete testimony icon"
                height={50}
                width={50}
              />
            </Internal>
          </>
        )}
      </div>
      <div>
        <Row className={`justify-content-between`}>
          <Col className={`h5 fw-bold align-self-center`}>
            {showBillNumber && (
              <>
                <Internal href={billLink}>
                  {formatBillId(testimony.billId)}
                </Internal>
                {" · "}
              </>
            )}
            {`${published} · `}
            <Internal href={maple.testimony(testimony)}>Full Text</Internal>
          </Col>
          <Col
            className={`ms-auto d-flex justify-content-start justify-content-sm-end`}
          >
            <PositionLabel position={testimony.position} />
          </Col>
        </Row>
        <Row className={`col m2`}>
          <Col className={`p-4 ps-3`} style={{ whiteSpace: "pre-wrap" }}>
            <FormattedTestimonyContent testimony={testimony.content} />
          </Col>
          {showControls && (
            <Col
              className={`d-none d-md-flex flex-column col-auto justify-content-center px-5 my-5 fs-5`}
              style={{
                fontFamily: "nunito",
                borderLeft: "1px solid rgb(200, 200, 200)",
                minWidth: "20%"
              }}
            >
              <Internal href={formUrl(testimony.billId, testimony.court)}>
                Edit
              </Internal>
              <Internal href={billLink}>Delete</Internal>
            </Col>
          )}
        </Row>
        <ViewAttachment testimony={testimony} />
      </div>
    </div>
  )
}

export const FormattedTestimonyContent = ({
  testimony
}: {
  testimony: string
}) => {
  const TESTIMONY_CHAR_LIMIT = 442
  const [showAllTestimony, setShowAllTestimony] = useState(false)

  return (
    <>
      {testimony.length > TESTIMONY_CHAR_LIMIT && !showAllTestimony ? (
        <>
          <div
            className="col m2"
            // TODO: Add char limit. May be easiest to trim it here
            // and fade it out to hide any formatting it breaks.
            dangerouslySetInnerHTML={formatTestimony(testimony)}
          />
          <Col className="ms-auto d-flex justify-content-start justify-content-sm-end">
            <Button
              variant="link"
              onClick={() => setShowAllTestimony(!showAllTestimony)}
            >
              Show More
            </Button>
          </Col>
        </>
      ) : (
        <div
          className="col m2"
          dangerouslySetInnerHTML={formatTestimony(testimony)}
        />
      )}
    </>
  )
}

export default ViewTestimony
