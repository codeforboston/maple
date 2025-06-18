import { FC } from "react"
import styled from "styled-components"
import { Position } from "common/testimony/types"

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
  height: 133px;
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    font-family: Nunito;
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

type ItemStance = {
  position: string
  svg: string
  shade: string
}

export const positionObj = [
  {
    position: "endorse",
    svg: "/thumbs-endorse.svg",
    shade: "var(--bs-green)"
  },
  {
    position: "oppose",
    svg: "/thumbs-oppose.svg",
    shade: "var(--bs-orange)"
  },
  {
    position: "neutral",
    svg: "/thumbs-neutral.svg",
    shade: "var(--bs-dark-blue)"
  }
]

export const OrgAvatar: FC<Props> = ({ orgImageSrc, name, position }) => {
  const obj: ItemStance = positionObj.find(
    stand => stand.position === position
  )!

  return (
    <>
      <OrgAvatarContainer>
        <ImageContainer style={{ borderColor: obj.shade }}>
          <img className="orgLogo" src={orgImageSrc} alt={name} />
          <img className="stanceIcon" src={obj.svg} alt={obj.position} />
        </ImageContainer>
        <p>{name}</p>
      </OrgAvatarContainer>
    </>
  )
}
