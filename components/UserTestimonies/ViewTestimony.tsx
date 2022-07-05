import { useMemo, useState } from "react"
import { useAuth } from "../../components/auth"
import { Testimony } from "../../functions/src/testimony/types"
import { Col, Dropdown, Row } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { useBill, usePublishedTestimonyListing } from "../db"
import { FormattedBillTitle } from "../formatting"
import { Internal } from "../links"
import { PositionLabel } from "./PositionBug"

export default function ViewTestimony() {
  const { user } = useAuth()
  const {
    items: { loading, result },
    setFilter
  } = usePublishedTestimonyListing({ uid: user?.uid })

  const testimony = useMemo(() => {
    return result ?? []
  }, [result])

  const [orderBy, setOrderBy] = useState<string>()

  return (
    <TitledSectionCard
      title={"Testimony Section"}
      bug={<SortTestimonyDropDown orderBy={orderBy} setOrderBy={setOrderBy} />}
    >
      {testimony.map(i => (
        <TestimonyItem key={i.authorUid + i.billId} testimony={i} />
      ))}
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
    <Dropdown>
      <Dropdown.Toggle variant="light" id="dropdown-order">
        {orderBy ?? "Order by"}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => setOrderBy("Most Recent")}>
          Most Recent
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setOrderBy("Alphabetical")}>
          Alphabetical
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setOrderBy("Alpha by Tag")}>
          Alpha by Tag
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export const TestimonyItem = ({ testimony }: { testimony: Testimony }) => {
  const published = testimony.publishedAt.toDate().toLocaleDateString()

  const { result: bill } = useBill(testimony.billId)

  return (
    <div className={`bg-white border-0 border-bottom p-xs-1 p-md-5`}>
      <div className={`bg-white border-0 h3`}>
        <Internal className={`text-secondary`} href="#">
          {bill && <FormattedBillTitle bill={bill} />}
        </Internal>
      </div>
      <div>
        <Row className={`justify-content-between`}>
          <Col className={`h5 fw-bold`}>{`${published}`}</Col>
          <Col
            className={`ms-auto d-flex justify-content-start justify-content-sm-end`}
          >
            <PositionLabel position={testimony.position} />
          </Col>
        </Row>
        <div className={`col m2`}>{testimony.content}</div>
      </div>
    </div>
  )
}
