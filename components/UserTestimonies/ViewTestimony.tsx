import { formUrl } from "components/publish/hooks"
import { NoResults } from "components/search/NoResults"
import { ViewAttachment } from "components/ViewAttachment"
import { useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Form, Row } from "../bootstrap"
import {
  Testimony,
  usePublicProfile,
  UsePublishedTestimonyListing
} from "../db"
import { formatBillId, formatTestimonyDate, formatTestimonyLinks } from "../formatting"
import { Internal } from "../links"
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
    items,
    showControls = false,
    showBillNumber = false,
    className
  } = props

  const testimony = items.result ?? []

  return (
    <TitledSectionCard
      title={"Testimony"}
      className={className}
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
    </TitledSectionCard>
  )
}

export const SortTestimonyDropDown = ({
  setOrderBy
} : {
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
  const isPublished = !!testimony.publishedAt
  const publishedVersion = () => isPublished ? formatTestimonyDate(testimony.publishedAt) : <span style={{color: '#ff8600'}}>Draft</span>

  return (
    <div className={`bg-white border-0 border-bottom p-3 p-sm-4 p-md-5`}>
      <div className={`bg-white border-0 h5 d-flex`}>
        <Author testimony={testimony} className="flex-grow-1" />
        {isMobile && showControls && (
          <>
            <Internal href={formUrl(testimony.billId)}>
              <Image
                className="px-2 ms-auto align-self-center"
                src="/edit-testimony.svg"
                alt="Edit icon"
                height={50}
                width={50}
              />
            </Internal>

            <Internal href={`/bill?id=${testimony.billId}`}>
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
                <Internal href={`/bill?id=${testimony.billId}`}>
                  {formatBillId(testimony.billId)}
                </Internal>
                {" · "}
              </>
            )}
            {publishedVersion()}{" · "}
            <Internal
              href={`/testimony?author=${testimony.authorUid}&billId=${testimony.billId}&published=${isPublished}`}
            >
              Full Text
            </Internal>
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
              <Internal href={formUrl(testimony.billId)}>Edit</Internal>
              <Internal href={`/bill?id=${testimony.billId}`}>Delete</Internal>
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
            dangerouslySetInnerHTML={formatTestimonyLinks(
              testimony,
              TESTIMONY_CHAR_LIMIT
            )}
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
          dangerouslySetInnerHTML={formatTestimonyLinks(testimony)}
        />
      )}
    </>
  )
}

export default ViewTestimony
