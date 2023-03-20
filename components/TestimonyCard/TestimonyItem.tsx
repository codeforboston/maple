import { formUrl } from "components/publish/hooks"
import { ListGroup } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { Col, Row, Stack } from "../bootstrap"
import { Testimony } from "../db"
import { formatBillId } from "../formatting"
import { Internal, maple } from "../links"
import { PositionLabel } from "./PositionBug"
import { ReportModal } from "./ReportModal"
import { useState } from "react"
import { FormattedTestimonyContent } from "./FormattedTestimonyItem"
import { ViewAttachment } from "components/ViewAttachment"
import styles from "./ViewTestimony.module.css"

export const TestimonyItem = ({
  testimony,
  isUser,
  showBillNumber
}: {
  testimony: Testimony
  isUser: boolean
  showBillNumber: boolean
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const published = testimony.publishedAt.toDate().toLocaleDateString()

  const billLink = maple.bill({
    id: testimony.billId,
    court: testimony.court
  })

  const [isReporting, setIsReporting] = useState(false)

  return (
    <div className={styles.itemrow}>
      <div className={`border-0 h5 d-flex`}>
        {isMobile && isUser && (
          <>
            <Internal
              className={styles.link}
              href={formUrl(testimony.billId, testimony.court)}
            >
              <Image
                className="px-2 ms-auto align-self-center"
                src="/edit-testimony.svg"
                alt="Edit icon"
                height={50}
                width={50}
              />
            </Internal>
            <Internal className={styles.link} href={billLink}>
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
      <Stack gap={2}>
        <Row className={`justify-content-between align-items-center`}>
          <Col xs="auto">
            {showBillNumber && (
              <h3 className="mt-0 mb-0">
                <Internal className={styles.link} href={billLink}>
                  {formatBillId(testimony.billId)}
                </Internal>
              </h3>
            )}
          </Col>

          <Col xs="auto">
            <PositionLabel position={testimony.position} />
          </Col>
          <Col className={`ms-auto d-flex justify-content-sm-end`}>
            {`${published}`}
          </Col>
        </Row>
        <Row className={`col m2`}>
          <FormattedTestimonyContent testimony={testimony.content} />
        </Row>
        <Row xs="auto" className={`col m2`}>
          <Col>
            <Internal
              className={styles.link}
              href={maple.testimony({ publishedId: testimony.id })}
            >
              More Details
            </Internal>
          </Col>
          {isUser ? (
            <>
              <Col>
                <Internal
                  className={styles.link}
                  href={formUrl(testimony.billId, testimony.court)}
                >
                  Edit
                </Internal>
              </Col>
              <Col>
                <Internal className={styles.link} href={billLink}>
                  Delete
                </Internal>
              </Col>
            </>
          ) : (
            <Col>
              <ListGroup.Item action onClick={() => setIsReporting(true)}>
                Report
              </ListGroup.Item>
            </Col>
          )}
        </Row>
      </Stack>

      <ViewAttachment testimony={testimony} />
      {isReporting && (
        <ReportModal
          onClose={() => setIsReporting(false)}
          onReport={report => {
            // TODO: connect to API call to add a report from this user
            console.log({ report })
          }}
          reasons={[
            "Personal Information",
            "Offensive",
            "Violent",
            "Spam",
            "Phishing"
          ]}
        />
      )}
    </div>
  )
}
