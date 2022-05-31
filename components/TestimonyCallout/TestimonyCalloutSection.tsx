import { Container, Col, Row } from "react-bootstrap"
import { useRecentTestimony } from "../db"
import TestimonyCallout from "./TestimonyCallout"
import styles from "./TestimonyCallout.module.css"

export default function TestimonyCalloutSection() {
  const recentTestimony = useRecentTestimony(4)

  return (
    <>
      <Row className="mt-5 justify-content-center">
        <Col xs={10}>
          <h1>What people are saying...</h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={10} xl={9} xxl={8}>
          <Row xs={1} lg={2} className={`g-2 justify-content-center py-2 mt-4`}>
            {recentTestimony?.map(testimony => (
              <TestimonyCallout
                key={testimony.authorUid + testimony.billId}
                {...testimony}
              />
            ))}
          </Row>
        </Col>
      </Row>
    </>
  )
}
