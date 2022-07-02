import { ReactNode } from "react"
import styled from "styled-components"

export const StyledColLabels = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-left: 0.5em;

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

export const CircleImage = styled.div`
  flex: 0;
  width: 6em;
  .image {
    clip-path: circle(40%);
    width: 6em;
    height: auto;
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
    <div className={`d-flex flex-grow-0 border`}>
      <CircleImage>
        <img src={idImage} alt={`${mainText} image`} className={`image`} />
      </CircleImage>
      <StyledColLabels>
        <div className="h5 main-text">{mainText}</div>
        <p className="sub-text">{subText}</p>
      </StyledColLabels>
    </div>
  )
}
