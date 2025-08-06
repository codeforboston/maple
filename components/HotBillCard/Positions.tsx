import React from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useTranslation } from "next-i18next"

export const Positions = (props: {
  endorseCount: number
  opposeCount: number
  neutralCount: number
}) => {
  const { t } = useTranslation("testimony")

  return (
    <PositionsStyle>
      <PositionStyle>
        <p className="stanceTitle">{t("counts.endorsements.title")}</p>
        <div>
          <Image className="svg" alt={t("counts.endorsements.alt")} />
          <p>{props.endorseCount}</p>
        </div>
      </PositionStyle>
      <PositionStyle>
        <p className="stanceTitle">{t("counts.neutral.title")}</p>
        <div>
          <Image
            className="svg"
            alt={t("counts.neutral.alt")}
            src="/thumbs-neutral.svg"
          />
          <p>{props.neutralCount}</p>
        </div>
      </PositionStyle>
      <PositionStyle>
        <p className="stanceTitle">{t("counts.oppose.title")}</p>
        <div>
          <Image
            className="svg"
            alt={t("counts.oppose.alt")}
            src="/thumbs-oppose.svg"
          />
          <p>{props.opposeCount}</p>
        </div>
      </PositionStyle>
    </PositionsStyle>
  )
}

const PositionsStyle = styled.div`
  display: flex;
  margin-right: 5%;

  font-family: "Nunito";
  font-style: normal;

  @media (max-width: 1250px) {
    margin-right: 10%;
  }
`
const PositionStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 10%;
  margin-bottom: 0;
  .stanceTitle {
    color: #8999d6;
  }
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
