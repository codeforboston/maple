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
  useBill,
  usePublicProfile,
  UsePublishedTestimonyListing
} from "../db"
import { formatBillId, formatTestimonyLinks } from "../formatting"
import { Internal } from "../links"
import { TitledSectionCard } from "../shared"
import { PositionLabel } from "./PositionBug"
import { Card as MapleCard } from "components/Card"
import { Tabs, Tab } from "./Tabs"

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

  const [activeTab, setActiveTab] = useState(1)

  const handleClick = (e: Event, value: number) => {
    setActiveTab(value)
  }

  const tabs = [
    <Tab key="at" label="All Testimonies" active={false} value={1} />,
    <Tab key="uo" label="Users Only" active={false} value={2} />,
    <Tab key="oo" label="Organizations Only" active={false} value={3} />
  ]
  const body = (
    <TitledSectionCard
      className={className}
      // bug={<SortTestimonyDropDown orderBy={orderBy} setOrderBy={setOrderBy} />}
    >
      <Tabs
        childTabs={tabs}
        onChange={handleClick}
        selectedTab={activeTab}
      ></Tabs>

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
  return <MapleCard header="Testimonies" body={body} />
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

const TestimonyItemContentStyle = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`
const TestimonyItemHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 100%;
`
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

  const { result: bill } = useBill(testimony.billId)

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* USER IMAGE and POSITION */}
      <PositionLabel position={testimony.position} />
      <TestimonyItemContentStyle>
        <TestimonyItemHeader>
          <>
            {/* NAME OF USER/ORGANIZATION */}
            <Author testimony={testimony} />
            {isMobile && showControls && (
              <>
                <Internal href={formUrl(testimony.billId)}>
                  <Image
                    src="/edit-testimony.svg"
                    alt="Edit icon"
                    height={50}
                    width={50}
                  />
                </Internal>

                <Internal href={`/bill?id=${testimony.billId}`}>
                  <Image
                    src="/delete-testimony.svg"
                    alt="Delete testimony icon"
                    height={50}
                    width={50}
                  />
                </Internal>
              </>
            )}
          </>
          <div>
            {showBillNumber && (
              <>
                <Internal href={`/bill?id=${testimony.billId}`}>
                  {formatBillId(testimony.billId)}
                </Internal>
                {" · "}
              </>
            )}
            {/* DATE */}
            {`${published} · `}
            <Internal
              href={`/testimony?author=${testimony.authorUid}&billId=${testimony.billId}`}
            >
              Full Text
            </Internal>
          </div>
        </TestimonyItemHeader>
        <hr />
        {/*WRITTEN TESTIMONY*/}
        <FormattedTestimonyContent testimony={testimony.content} />
        {showControls && (
          <div
            style={{
              fontFamily: "nunito",
              borderLeft: "1px solid rgb(200, 200, 200)",
              minWidth: "20%"
            }}
          >
            <Internal href={formUrl(testimony.billId)}>Edit</Internal>
            <Internal href={`/bill?id=${testimony.billId}`}>Delete</Internal>
          </div>
        )}
        <ViewAttachment testimony={testimony} />
      </TestimonyItemContentStyle>
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
            dangerouslySetInnerHTML={formatTestimonyLinks(
              testimony,
              TESTIMONY_CHAR_LIMIT
            )}
          />
          <Button
            variant="link"
            onClick={() => setShowAllTestimony(!showAllTestimony)}
          >
            Show More
          </Button>
        </>
      ) : (
        <div dangerouslySetInnerHTML={formatTestimonyLinks(testimony)} />
      )}
    </>
  )
}

export default ViewTestimony
