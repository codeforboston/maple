import { useTranslation } from "next-i18next"
import CardBootstrap from "react-bootstrap/Card"
import { useMediaQuery } from "usehooks-ts"
import { Col, Row } from "../bootstrap"
import { Internal } from "components/links"
import { truncateText } from "components/formatting"

interface NewsfeedCardBodyProps {
  billText?: string
  position?: string
  text?: string
  timestamp?: string
  testimonyId?: string
  type?: string
}

export const NewsfeedBillCardBody = (props: NewsfeedCardBodyProps) => {
  const { position, text, timestamp } = props
  const { t } = useTranslation("common")
  const isMobile = useMediaQuery("(max-width: 550px)")
  return (
    <CardBootstrap.Body className={`p-0`}>
      <div
        className={`align-items-center bg-info d-flex mx-2 mt-1 mb-2 p-2 rounded`}
      >
        {isMobile ? (
          <>
            <Col className={`d-flex align-items-center flex-column m-2`}>
              <img
                src="\images\clock.svg"
                height="105.6"
                width="105.6"
                alt={position}
                className={`m-3`}
              />
              <CardBootstrap.Text className={`mb-0 mt-2`}>
                <strong>{truncateText(text, 600)}</strong>
              </CardBootstrap.Text>
              <>
                {t("newsfeed.actionTaken")}
                {timestamp}
              </>
            </Col>
          </>
        ) : (
          <>
            <img
              src="\images\clock.svg"
              height="105.6"
              width="105.6"
              alt={position}
              className={`m-3`}
            />
            <Col className={`m-2`}>
              <CardBootstrap.Text className={`mb-0`}>
                <strong>{truncateText(text, 600)}</strong>
              </CardBootstrap.Text>
              <>
                {t("newsfeed.actionTaken")}
                {timestamp}
              </>
            </Col>
          </>
        )}
      </div>
    </CardBootstrap.Body>
  )
}

export const NewsfeedTestimonyCardBody = (props: NewsfeedCardBodyProps) => {
  const { billText, position, text, testimonyId, timestamp } = props
  const isMobile = useMediaQuery("(max-width: 576px)")

  function capitalizeFirstLetter(x: String | undefined) {
    return String(x).charAt(0).toUpperCase() + String(x).slice(1)
  }

  let endorsementColor = ""

  switch (position) {
    case "endorse":
      endorsementColor = `text-success`
      break
    case "oppose":
      endorsementColor = `text-warning`
      break
    default:
      endorsementColor = `text-secondary`
      break
  }

  return (
    <div>
      <CardBootstrap.Body className={`p-2`}>
        <CardBootstrap.Text className={`text-secondary mb-2`}>
          <strong>{billText}</strong>
        </CardBootstrap.Text>
        <Row className={`bg-body mx-0 mt-1 rounded`}>
          {isMobile ? (
            <Col className={`d-flex flex-column m-2 w-100`} xs="2">
              <div className={`align-self-center justify-content-center my-3`}>
                {position && (
                  <>
                    <img
                      src={`/thumbs-${position}.svg`}
                      height="108"
                      width="106.5"
                      alt={position}
                    />
                    <div className={`${endorsementColor} fs-5`}>
                      {capitalizeFirstLetter(props.position)}
                    </div>
                  </>
                )}
              </div>
              <strong className={`mb-4`}>{`"${truncateText(
                text,
                600
              )}"`}</strong>
            </Col>
          ) : (
            <>
              {position && (
                <Col
                  className={`d-flex align-self-center flex-column m-2`}
                  xs="2"
                >
                  <>
                    <img
                      src={`/thumbs-${position}.svg`}
                      height="72"
                      width="72"
                      alt={position}
                    />

                    <div className={`${endorsementColor}`}>
                      {capitalizeFirstLetter(props.position)}
                    </div>
                  </>
                </Col>
              )}
              <Col
                className={`d-flex align-self-center justify-content-center`}
              >
                <strong className={`m-4`}>{`"${truncateText(
                  text,
                  600
                )}"`}</strong>
              </Col>
            </>
          )}
        </Row>
        <NewsfeedTestimonyCardTail
          testimonyId={testimonyId}
          timestamp={timestamp}
        />
      </CardBootstrap.Body>
    </div>
  )
}

const NewsfeedTestimonyCardTail = (props: NewsfeedCardBodyProps) => {
  const { testimonyId, timestamp } = props
  const { t } = useTranslation("common")
  const isMobile = useMediaQuery("(max-width: 576px)")
  return (
    <>
      {isMobile ? (
        <Col className={`d-flex flex-wrap mt-2 mb-2`}>
          <Row className={`w-100`}>
            <div>
              {t("newsfeed.endorsementPost")}
              {timestamp}
            </div>
          </Row>
          <Row className={`w-100`}>
            <Internal href={`/testimony/${testimonyId}`}>
              <div>{t("newsfeed.viewFullTestimony")}</div>
            </Internal>
          </Row>
        </Col>
      ) : (
        <div className={`d-flex justify-content-between mt-2 mb-2`}>
          <div>
            {t("newsfeed.endorsementPost")}
            {timestamp}
          </div>
          <Internal href={`/testimony/${testimonyId}`}>
            <div>{t("newsfeed.viewFullTestimony")}</div>
          </Internal>
        </div>
      )}
    </>
  )
}
