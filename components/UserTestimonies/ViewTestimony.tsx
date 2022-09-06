import { useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Form, Row } from "../bootstrap"
import { Testimony, useBill, UsePublishedTestimonyListing } from "../db"
import { FormattedBillTitle, formatTestimonyLinks } from "../formatting"
import { Internal, Wrap } from "../links"
import { TitledSectionCard } from "../shared"
import { PaginationButtons } from "../table"
import { PositionLabel } from "./PositionBug"

const ViewTestimony = (
  props: UsePublishedTestimonyListing & { search?: boolean } & {
    showControls?: boolean
  }
) => {
  const { pagination, items, setFilter, showControls = false } = props
  const testimony = items.result ?? []

  const [orderBy, setOrderBy] = useState<string>()

  return (
    <TitledSectionCard
      title={"Testimony"}
      bug={<SortTestimonyDropDown orderBy={orderBy} setOrderBy={setOrderBy} />}
    >
      {testimony.map(t => (
        <TestimonyItem
          key={t.authorUid + t.billId}
          testimony={t}
          showControls={showControls}
        />
      ))}
      <PaginationButtons pagination={pagination} />
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

const StyledTitle = styled(Internal)`
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
  showControls
}: {
  testimony: Testimony
  showControls: boolean
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const published = testimony.publishedAt.toDate().toLocaleDateString()

  const { result: bill } = useBill(testimony.billId)

  return (
    <div className={`bg-white border-0 border-bottom p-3 p-sm-4 p-md-5`}>
      <div className={`bg-white border-0 h3 d-flex`}>
        <StyledTitle className="text-secondary" href="#">
          {bill && <FormattedBillTitle bill={bill} />}
        </StyledTitle>
        {isMobile && (
          <>
            <Image
              className="px-2 ms-auto align-self-center"
              src="/edit-testimony.svg"
              alt="Edit icon"
              height={50}
              width={50}
            />

            <Image
              className="px-2 align-self-center"
              src="/hide-testimony.svg"
              alt="Hide testimony icon"
              height={50}
              width={50}
            />
          </>
        )}
      </div>
      <div>
        <Row className={`justify-content-between`}>
          <Col className={`h5 fw-bold align-self-center`}>{`${published}`}</Col>
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
              <Wrap href="#"> Edit</Wrap>
              <Wrap href="#">Delete</Wrap>
            </Col>
          )}
        </Row>
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
