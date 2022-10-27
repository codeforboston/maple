import { FC } from "react"
import styled from "styled-components"

const ImageContainer = styled.div`
  width: 87px;
  height: 87px;
  border: 2.5px solid var(--bs-green); //dependant on the stance
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
  padding: 0px;

  p {
    font-size: 12px;
    text-align: center;
    letter-spacing: 0.03em;
    margin-top: 0.5rem;
  }
`

interface Props {
  name: string
  orgImageSrc: string
  stanceTitle: string
}

export const stance = [
  {
    title: "endorse",
    svg: "/Thumbs up.svg",
    shade: "var(--bs-green)"
  },
  {
    title: "neutral",
    svg: "/Neutral-icon.svg",
    shade: "var(--bs-dark-blue)"
  },
  {
    title: "reject",
    svg: "/Thumbs-down.svg",
    shade: "var(--bs-orange)"
  }
]

export const OrgAvatar: FC<Props> = ({ orgImageSrc, name, stanceTitle }) => {
  type ItemStance = {
    title?: string
    svg?: string
    shade?: string
    [key: string]: any
  }
  const obj: ItemStance = stance.filter(stand => stand.title === stanceTitle)
  console.log(obj)
  return (
    <>
      <OrgAvatarContainer>
        <ImageContainer style={{ borderColor: obj[0].shade }}>
          <img className="orgLogo" src={orgImageSrc} alt={name} />
          <img className="stanceIcon" src={obj[0].svg} alt={obj[0].title} />
        </ImageContainer>
        <p>{name}</p>
      </OrgAvatarContainer>
    </>
  )
}
