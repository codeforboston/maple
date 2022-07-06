import { Col, Row, Image } from "../bootstrap"
import styled from "styled-components"
import { ReactNode } from "react"

export const StyledColLabels = styled.div`
  flex: 0;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  .main-text {
    font-weight: 900;
    margin: 0;
    flex: 0;
  }

  .sub-text {
    font-weight: 500;
    margin: 0;
    flex: 0;
  }
`

export const CircleImage = styled.div.attrs((props: { trnsImg: string }) => ({
  trnsImg: props.trnsImg || ""
}))`
  flex: 0;
  clip-path: circle(40%);
  margin: 1em 0 1em 1em;

  .image {
    height: 6em;
    width: 6em;
    background-color: grey;
    transform: ${props => props.trnsImg};
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
    <div className={`d-flex justify-content-center bg-light`}>
      <CircleImage trnsImg={"scale(1)"}>
        <img src={idImage} alt={`${mainText} image`} className={`image`} />
      </CircleImage>
      <StyledColLabels>
        <div className="h5 main-text">{mainText}</div>
        <p className="main-text">{subText}</p>
      </StyledColLabels>
    </div>
  )
}
