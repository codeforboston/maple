import { formUrl } from "components/publish/hooks"
import { NoResults } from "components/search/NoResults"
import { ViewAttachment } from "components/ViewAttachment"
import { useState, ReactEventHandler } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Form, Row, Dropdown } from "../bootstrap"
import {
  Testimony,
  useBill,
  profileImageUrl,
  usePublicProfile,
  UsePublishedTestimonyListing
} from "../db"
import { formatBillId, formatTestimonyLinks } from "../formatting"
import { Internal } from "../links"
import { TitledSectionCard } from "../shared"
import { PositionLabel } from "./PositionBug"
import { Card as MapleCard } from "components/Card"
import { Tabs, Tab } from "./Tabs"
import { UserFilterDropDown } from "./UserFilterDropdown"
import { current } from "@reduxjs/toolkit"
import { RelevantSortConnector } from "instantsearch.js/es/connectors/relevant-sort/connectRelevantSort"

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

  // const [orderBy, setOrderBy] = useState<string>("Most Recent")
  // const [shown, setShown] = useState<string>("All Published Testimonies")

  const [activeTab, setActiveTab] = useState(1)

  const handleTabClick = (e: Event, value: number) => {
    setActiveTab(value)
  }

  // const handleOrderClick = (e: React.MouseEvent<Element>) => {
  //   setOrderBy((e.currentTarget as HTMLElement).innerText)
  // }

  // const handleShownClick = (e: React.MouseEvent<Element>) => {
  //   setShown((e.currentTarget as HTMLElement).innerText)
  // }

  const tabs = [
    <Tab key="at" label="All Testimonies" active={false} value={1} />,
    <Tab key="uo" label="Individuals" active={false} value={2} />,
    <Tab key="oo" label="Organizations" active={false} value={3} />
  ]
  const body = (
    <TitledSectionCard className={className}>
      {testimony.length > 0 && (
        <Tabs
          childTabs={tabs}
          onChange={handleTabClick}
          selectedTab={activeTab}
        ></Tabs>
      )}
      {/* <DropDownsContainerStyle>
        <UserFilterDropDown handleUsers={handleShownClick} users={shown} />
        <OrderFilterDropDownMenu
          handleOrder={handleOrderClick}
          currentOrder={orderBy}
        />
      </DropDownsContainerStyle> */}
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
  button {
    align-self: flex-end;
  }
  hr {
    height: 3px;
    background-color: grey;
  }
`
const TestimonyItemHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: -15px;
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
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        margin: "5%"
      }}
    >
      {/* USER IMAGE and POSITION */}
      <PositionLabel
        position={testimony.position}
        avatar="individualUser.svg"
      />
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
            {`${published}`}
            {/* Need to research meaning of Full Text and it's relationship with Show more" */}
            {/* <Internal
              href={`/testimony?author=${testimony.authorUid}&billId=${testimony.billId}`}
            >
              Full Text
            </Internal> */}
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

export const OrderFilterDropDownMenu = (props: {
  currentOrder: string
  handleOrder?: ReactEventHandler
}) => {
  const { handleOrder, currentOrder } = props

  return (
    <DropdownContainer className="doodads">
      <StyledDropdown
        variant="success"
        id="dropdown-basic"
        className="order-filter"
      >
        {currentOrder}
      </StyledDropdown>

      <Dropdown.Menu>
        <Dropdown.Item onClick={handleOrder}>Most Recent</Dropdown.Item>
        <Dropdown.Item onClick={handleOrder}>Oldest</Dropdown.Item>
      </Dropdown.Menu>
    </DropdownContainer>
  )
}
export default ViewTestimony

const DropdownContainer = styled(Dropdown)`
  display: flex;
  flex-direction: row-reverse;
  margin: 5px;
  background: none !important;
`
const StyledDropdown = styled(Dropdown.Toggle)`
  display: flex;
  flex-direction: space-between;
  align-items: center;
  padding: 5px;

  font-size: 1.5rem;
  font-family: Nunito;

  background-color: white;
  border: 1px solid lightgrey;

  &:active,
  &:focus,
  &:hover {
    background-color: white !important;
    border-color: black !important;
  }
  &:active,
  &:focus {
    box-shadow: 0px 0px 10px 4px orange !important;
  }
  :after {
    display: flex;
    align-items: center;
    margin-left: auto;
    vertical-align: none;
    content: "▼";
    border-top: none;
    border-right: none;
    border-bottom: none;
    border-left: none;
    font-size: 30px;
  }
  &: .order-filter {
    color: red !important;
    background-color: red !important;
  }
`

const DropDownsContainerStyle = styled.div`
  display: flex;
`
