import CardBootstrap from "react-bootstrap/Card"
import { useMediaQuery } from "usehooks-ts"
import { Col, Row } from "../bootstrap"

interface NewsfeedCardBodyProps {
  imgSrc?: string
  imgAltTxt?: string
  text?: string
  timestamp?: string
}

export const NewsfeedBillCardBody = (props: NewsfeedCardBodyProps) => {
  const { imgAltTxt, text, timestamp } = props
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
                alt={imgAltTxt}
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
              alt={imgAltTxt}
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
  const { imgSrc, imgAltTxt, text, timestamp } = props
  const isMobile = useMediaQuery("(max-width: 550px)")

  function capitalizeFirstLetter(x: String | undefined) {
    return String(x).charAt(0).toUpperCase() + String(x).slice(1)
  }

  let endorsementColor = ""

  switch (imgAltTxt) {
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
          {/* <strong>{testimonyText}</strong> */}
        </CardBootstrap.Text>
        <Row className={`bg-body mx-0 mt-1 rounded`}>
          {isMobile ? (
            <Col className={`d-flex flex-column m-2 w-100`} xs="2">
              <div className={`align-self-center my-3`}>
                {imgSrc && (
                  <img
                    src={imgSrc}
                    height="108"
                    width="106.5"
                    alt={imgAltTxt}
                  ></img>
                )}
                <div className={`${endorsementColor} fs-5`}>
                  {capitalizeFirstLetter(props.imgAltTxt)}
                </div>
              </div>
              <strong>
                {`"`}
                {text}
                {`"`}
              </strong>
            </Col>
          ) : (
            <>
              <Col className={`d-flex flex-column m-2`} xs="2">
                {imgSrc && (
                  <img
                    src={imgSrc}
                    height="72"
                    width="72"
                    alt={imgAltTxt}
                  ></img>
                )}
                <div className={`${endorsementColor}`}>
                  {capitalizeFirstLetter(props.imgAltTxt)}
                </div>
              </Col>
              <Col className={`d-flex align-self-center`}>
                <strong>
                  {`"`}
                  {text}
                  {`"`}
                </strong>
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
  const isMobile = useMediaQuery("(max-width: 500px)")
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
            <div>{"View Full Testimony"}</div>
          </Row>
        </Col>
      ) : (
        <div className={`d-flex justify-content-between mt-2 mb-2`}>
          <div>
            {"Endorsement Posted "}
            {timestamp}
          </div>
          {/* convert to link when testionyID is made available through newsfeed-results object*/}
          <div>{"View Full Testimony"}</div>
        </div>
      )}
    </>
  )
}
