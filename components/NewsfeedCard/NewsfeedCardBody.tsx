import CardBootstrap from "react-bootstrap/Card"
import { useMediaQuery } from "usehooks-ts"
import { Col, Row } from "../bootstrap"

interface NewsfeedCardBodyProps {
  billText?: string
  position?: string
  text?: string
  timestamp?: string
  type?: string
}

export const NewsfeedBillCardBody = (props: NewsfeedCardBodyProps) => {
  const { position, text, timestamp } = props
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
                <strong>{text}</strong>
              </CardBootstrap.Text>
              <>
                {"Action taken on "}
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
                <strong>{text}</strong>
              </CardBootstrap.Text>
              <>
                {"Action taken on "}
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
  const { billText, position, text, timestamp, type } = props
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
          {/* uncomment when bill text is made available to for results: type testimony */}
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
              <strong className={`mb-4`}>{`"${text}"`}</strong>
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
                <strong className={`m-4`}>{`"${text}"`}</strong>
              </Col>
            </>
          )}
        </Row>
        <NewsfeedTestimonyCardTail timestamp={timestamp} />
      </CardBootstrap.Body>
    </div>
  )
}

const NewsfeedTestimonyCardTail = (props: NewsfeedCardBodyProps) => {
  const { timestamp } = props
  const isMobile = useMediaQuery("(max-width: 576px)")
  return (
    <>
      {isMobile ? (
        <Col className={`d-flex flex-wrap mt-2 mb-2`}>
          <Row className={`w-100`}>
            <div>
              {"Endorsement Posted "}
              {timestamp}
            </div>
          </Row>
          {/* convert to link when testionyID is made available through newsfeed-results object*/}
          <Row className={`w-100`}>
            {/* <div>{"View Full Testimony"}</div> */}
          </Row>
        </Col>
      ) : (
        <div className={`d-flex justify-content-between mt-2 mb-2`}>
          <div>
            {"Endorsement Posted "}
            {timestamp}
          </div>
          {/* convert to link when testionyID is made available through newsfeed-results object*/}
          {/* <div>{"View Full Testimony"}</div> */}
        </div>
      )}
    </>
  )
}
