import { Col, Image, Row } from "react-bootstrap"
import { Testimony } from "../../functions/src/testimony/types"
import { formatBillId } from "../formatting"
import styles from "./TestimonyCallout.module.css"

export const VoteHand = ({ position }: { position: Testimony["position"] }) => {
  return (
    <Image
      className={`${position === "endorse" ? styles.flip : ""} ${
        position === "neutral" ? styles.flipRotate : ""
      }`}
      alt={`${position}`}
      src="VoteHand.png"
      style={{ margin: "-1em" }}
    />
  )
}

export default function TestimonyCallout(props: Testimony) {
  const { authorDisplayName, billId, position, content } = props

  return (
    <div>
      <Row
        className={`row-col-2 ${styles.testimonyCalloutContainer} ${styles[position]} m-2`}
      >
        <Col className="col-auto">
          <Row className="h-100">
            <Col 
              className={`col-auto m-0 ${styles.testimonyCalloutContainerTriangle}`}
            ></Col>
            <Col className="col-auto my-auto">
              <VoteHand position={position} />
            </Col>
          </Row>
        </Col>
        <Col className="">
          <Row className="m-2">
            <Col className="">
              <Row>
                <Col
                  className={`${styles.testimonyCalloutBodyText} align-items-start`}
                >
                  {content}
                </Col>
              </Row>
              <Row className="mt-auto w-100 justify-content-start">
                <Col className="col-auto text-white">
                  Bill {formatBillId(billId)}
                </Col>
                <Col className="col-auto text-white ms-auto">
                  -{authorDisplayName}
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>{" "}
      </Row>
    </div>
  )
}
