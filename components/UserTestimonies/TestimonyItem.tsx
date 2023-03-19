import { formUrl } from "components/publish/hooks"
import { ListGroup } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { Col, Row } from "../bootstrap"
import { Testimony } from "../db"
import { formatBillId } from "../formatting"
import { Internal, maple } from "../links"
import { PositionLabel } from "./PositionBug"
import { ReportModal } from "./ReportModal"
import { useState } from "react"
import { FormattedTestimonyContent } from "./FormattedTestimonyItem"
import { ViewAttachment } from "components/ViewAttachment"

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
    // const published = testimony.publishedAt.toDate().toLocaleDateString()
    const published = "03/01/2023"

    const billLink = maple.bill({
      id: testimony.billId,
      court: testimony.court
    })
  
    const [isReporting, setIsReporting] = useState(false)
  
    return (
      <div className={`border-bottom`}>
        <div className={`border-0 h5 d-flex`}>
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
  
          <Row className={`justify-content-between`}>
            <Col className={`h5 align-self-center`}>
              {showBillNumber && (
                <>
                  <Internal className="link" href={billLink}>
                    {formatBillId(testimony.billId)}
                  </Internal>
                  {" · "}
                </>
              )}
              <PositionLabel position={testimony.position} />
            </Col>
            <Col
              className={`ms-auto d-flex justify-content-start justify-content-sm-end`}
            >
              {`${published}`}
            </Col>
          </Row>
          <Row className={`col m2`}>
              <FormattedTestimonyContent testimony={testimony.content} />
          </Row>
          <Row className={`col m2`}>
            <Col className={`p-4 ps-3`}>
              
              <Internal href={maple.testimony({ publishedId: testimony.id })}>
                More Details
              </Internal>
            </Col>
            {showControls ? (
              <div>
                <Col>
                  <Internal href={formUrl(testimony.billId, testimony.court)}>
                    Edit
                  </Internal>
                </Col>
              <Col>              
                <Internal href={billLink}>Delete</Internal>
              </Col>
  
              </div>
              
            ) : (
              <ListGroup>
                <ListGroup.Item action onClick={() => setIsReporting(true)}>
                  Report
                </ListGroup.Item>
              </ListGroup>
            )}
            
          </Row>
    
  
          
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
  