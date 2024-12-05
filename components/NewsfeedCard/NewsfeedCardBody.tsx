import { Timestamp } from "firebase/firestore"
import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styled from "styled-components"
import { Col, Row, Spinner } from "../bootstrap"

interface NewsfeedCardBodyProps {
  imgSrc?: string
  imgAltTxt?: string
  text: string
  timestamp?: string
}

export const NewsfeedBillCardBody = (props: NewsfeedCardBodyProps) => {
  const { imgSrc, imgAltTxt, text, timestamp } = props
  return (
    <CardBootstrap.Body className={`p-0`}>
      <div
        className={`align-items-center bg-info d-flex mx-2 mt-1 mb-2 p-2 rounded`}
      >
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
      </div>
    </CardBootstrap.Body>
  )
}

export const NewsfeedTestimonyCardBody = (props: NewsfeedCardBodyProps) => {
  const { imgSrc, imgAltTxt, text, timestamp } = props

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
          <strong>{text}</strong>
        </CardBootstrap.Text>
        <Row className={`bg-body mx-0 mt-1 rounded`}>
          <Col className={`d-flex flex-column mx-2 my-2`} xs="2">
            {imgSrc && (
              <img src={imgSrc} height="72" width="72" alt={imgAltTxt}></img>
            )}
            <div className={`${endorsementColor}`}>
              {capitalizeFirstLetter(props.imgAltTxt)}
            </div>
          </Col>
          <Col className={`d-flex align-self-center`}>
            {`"`}
            <strong>{text}</strong>
            {`"`}
          </Col>
        </Row>
        <div className={`mt-2 mb-2`}>
          {"Endorsement Posted "}
          {timestamp}
        </div>
      </CardBootstrap.Body>
    </div>
  )
}
