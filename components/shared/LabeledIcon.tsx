import { Col, Row, Image } from "../bootstrap"
import styled from "styled-components"
import { ReactNode } from "react"

export const CircleImage = styled.div`
  clip-path: circle(50%);
  flex: 1;
  place-content: center;
  height: 100%;
  aspect-ratio: 1;
`
export const StyledColLabels = styled(Col)`
  flex-wrap: nowrap;
  white-space: nowrap;
  display: flex;
  flex: 1 0;
  height: 4em;
  align-self: flex-end;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  .beans {

  }

`

export const LabeledIcon = ({
  idImage,
  mainText,
  subText
}: {
  idImage: string
  mainText: ReactNode
  subText: ReactNode
}) => {
  return (
    <Row className={`d-flex align-items-start justify-content-center mt-3`}>
      <Col className={` flex-grow-0`} style={{height: "4em"}}>
        <CircleImage>
          <Image
            fluid
            src={idImage}
            alt={`${mainText} image`}
            className={`flex-grow-0`}
          />
        </CircleImage>
      </Col>
      <StyledColLabels className="">
        <div className="h5 flex-grow-0 m-0 fw-bold">{mainText}</div>
        <p className="flex-grow-0 m-0">{subText}</p>
      </StyledColLabels>
    </Row>
  )
}
