import { formUrl } from "components/publish/hooks"
import { ListGroup } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { Col, Row, Stack, Button } from "../bootstrap"
import styled from "styled-components"
import { Testimony } from "../db"
import { Internal, maple } from "../links"
import { UserInfoHeader } from "./UserInfoHeader"
import { BillInfoHeader } from "./BillInfoHeader"
import { ReportModal } from "./ReportModal"
import { useState } from "react"
import { TestimonyContent } from "components/testimony"
import { ViewAttachment } from "components/ViewAttachment"
import styles from "./ViewTestimony.module.css"

const FooterButton = styled(Button)`
  margin: 0;
  padding: 0;
  text-decoration: none;
`

export const TestimonyItem = ({
  testimony,
  isUser,
  showBillInfo
}: {
  testimony: Testimony
  isUser: boolean
  showBillInfo: boolean
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const publishedDate = testimony.publishedAt.toDate().toLocaleDateString()

  const billLink = maple.bill({
    id: testimony.billId,
    court: testimony.court
  })

  const [isReporting, setIsReporting] = useState(false)

  const testimonyContent = testimony.content

  const snippetChars = 500
  const [showAllTestimony, setShowAllTestimony] = useState(false)
  const snippet = showAllTestimony
    ? testimonyContent
    : testimonyContent.slice(0, snippetChars)
  const canExpand = snippet.length !== testimonyContent.length

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
          {showBillInfo ? (
            <BillInfoHeader
              testimony={testimony}
              billLink={billLink}
              publishedDate={publishedDate}
            />
          ) : (
            <UserInfoHeader
              testimony={testimony}
              billLink={billLink}
              publishedDate={publishedDate}
            />
          )}
        </Row>
        <Row className={`col m2`}>
          <TestimonyContent className="col m2" testimony={snippet} />
        </Row>
        <Row xs="auto" className={`col m2`}>
          {isUser ? (
            <Col>
              <FooterButton variant="link">
                <Internal
                  className={styles.link}
                  href={maple.testimony({ publishedId: testimony.id })}
                >
                  More Details
                </Internal>
              </FooterButton>
            </Col>
          ) : (
            <>
              <Col>
                <FooterButton
                  variant="link"
                  onClick={() => setIsReporting(true)}
                >
                  Report
                </FooterButton>
              </Col>
              <Col>
                <FooterButton variant="link">
                  <ViewAttachment testimony={testimony} />
                </FooterButton>
              </Col>

              <Col>
                {canExpand && (
                  <FooterButton
                    variant="link"
                    onClick={() => setShowAllTestimony(true)}
                  >
                    Show More
                  </FooterButton>
                )}
              </Col>
            </>
          )}
        </Row>
      </Stack>

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
