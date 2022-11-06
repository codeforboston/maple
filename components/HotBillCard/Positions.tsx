import React from "react"
import { Container, CardImg } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import ThumbsUp from "../../public/Thumbs Up.svg"

export const Positions = (props: {
  endorseCount: number
  opposeCount: number
  neutralCount: number
}) => {
  return (
    <PositionsStyle>
      <PositionStyle>
        <p>Endorse</p>
        <div>
          <Image
            className="svg"
            alt=""
            src="Thumbs Up.svg"
            style={{ fill: "#AB7C94" }}
          />
          <p>{props.endorseCount}</p>
        </div>
      </PositionStyle>
      <PositionStyle>
        <p>Neutral</p>
        <div>
          <Image className="svg" alt="" src="Thumbs Neut.svg" />
          <p>{props.neutralCount}</p>
        </div>
      </PositionStyle>
      <PositionStyle>
        <p>Oppose</p>
        <div>
          <Image className="svg" alt="" src="Thumbs Down.svg" />
          <p>{props.opposeCount}</p>
        </div>
      </PositionStyle>
    </PositionsStyle>
  )
}

const PositionsStyle = styled.div`
  display: flex;
  margin-right: 15%;
`
const PositionStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 10%;
  margin-bottom: 0;
  p {
    margin: 0;
  }
  div {
    margin: 5%;
    display: flex;
    align-items: center;
    text-align: center;
    .svg {
      margin-right: 5%;
    }
  }
`
