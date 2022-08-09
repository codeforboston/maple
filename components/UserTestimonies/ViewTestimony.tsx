import { useMemo, useState } from "react"
import { useAuth } from "../../components/auth"
import { Testimony } from "../db"
import { Col, Dropdown, Row } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { useBill, usePublishedTestimonyListing } from "../db"
import { FormattedBillTitle } from "../formatting"
import { Internal } from "../links"
import { PositionLabel } from "./PositionBug"
import styles from "./ViewTestimony.module.css"

export default function ViewTestimony({ uid }: { uid?: string }) {
  const {
    items: { loading, result },
    setFilter
  } = usePublishedTestimonyListing({ uid: uid })

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
      <Dropdown.Toggle
        variant="primary"
        id="dropdown-order"
        bsPrefix={styles.toggleIcon}
      >
        {orderBy ?? "Order by"}{" "}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => setOrderBy("Most Recent First")}>
          Most Recent First
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setOrderBy("Oldest First")}>
          Oldest First
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export const TestimonyItem = ({ testimony }: { testimony: Testimony }) => {
  const published = testimony.publishedAt.toDate().toLocaleDateString()

  const { result: bill } = useBill(testimony.billId)

  const TESTIMONY_CHAR_LIMIT = 442
  const [showAllTestimony, setShowAllTestimony] = useState(false)

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
        <FormattedTestimonyContent testimony={testimony.content} />
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
          <div className={`col m2`}>
            {testimony.slice(0, TESTIMONY_CHAR_LIMIT) + "...."}
          </div>
          <Col
            className={`ms-auto d-flex justify-content-start justify-content-sm-end`}
          >
            <a href="#" onClick={() => setShowAllTestimony(!showAllTestimony)}>
              Show More
            </a>
          </Col>
        </>
      ) : (
        <div className={`col m2`}>{testimony}</div>
      )}
    </>
  )
}
