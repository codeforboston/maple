import { FC } from "react"
import styled from "styled-components"
import { Position } from "components/db"

const ImageContainer = styled.div`
  width: 87px;
  height: 87px;
  border: 2.5px solid;
  border-radius: 50%;
  position: relative;

  .orgLogo {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: contain;
    border: 2.5px solid white;
  }

  .stanceIcon {
    width: 1.5rem;
    height: 1.5rem;
    position: absolute;
    bottom: -0.75rem;
    left: calc(50% - 0.75rem);
  }
`

const OrgAvatarContainer = styled.div`
  width: 124px;
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    font-family: "Nunito";
    font-size: 12px;
    text-align: center;
    letter-spacing: 0.03em;
    line-height: 1rem;
    margin-top: 0.5rem;
  }
`

interface Props {
  name: string
  orgImageSrc: string
  position: Position
}

export const positionObj = [
  {
    position: "endorse",
    svg: "/thumbs-up2.svg",
    shade: "var(--bs-green)"
  },
  {
    position: "neutral",
    svg: "/Neutral-icon.svg",
    shade: "var(--bs-dark-blue)"
  },
  {
    position: "oppose",
    svg: "/thumbs-down.svg",
    shade: "var(--bs-orange)"
  }
]

export const OrgAvatar: FC<Props> = ({ orgImageSrc, name, position }) => {
  const pos = positionObj.find(pos => pos.position === position)!

  return (
    <>
      <OrgAvatarContainer>
        <ImageContainer style={{ borderColor: pos.shade }}>
          <img className="orgLogo" src={orgImageSrc} alt={name} />
          <img className="stanceIcon" src={pos.svg} alt={pos.position} />
        </ImageContainer>
        <p>{name}</p>
      </OrgAvatarContainer>
    </>
  )
}
