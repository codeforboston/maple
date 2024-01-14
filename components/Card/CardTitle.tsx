import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styled from "styled-components"

interface CardTitleProps {
  header?: string
  subheader?: string
  timestamp?: string
  imgSrc?: string
  inHeaderElement?: ReactElement
}

const CardImg = styled.img``

export const CardTitle = (props: CardTitleProps) => {
  const { header, subheader, timestamp, imgSrc, inHeaderElement } = props
  return (
    <CardBootstrap.Body
      className={`align-items-center bg-secondary d-flex text-white`}
    >
      {imgSrc && <CardImg src={imgSrc} width="75" height="75" />}
      <CardBootstrap.Body>
        {header && (
          <CardBootstrap.Title className={`fs-4 lh-sm mb-1`}>
            {header}
          </CardBootstrap.Title>
        )}
        {subheader && (
          <CardBootstrap.Text className={`fs-5 lh-sm mb-1`}>
            {subheader}
          </CardBootstrap.Text>
        )}
        {timestamp && (
          <CardBootstrap.Text className={`fs-6 lh-sm`}>
            {timestamp}
          </CardBootstrap.Text>
        )}
      </CardBootstrap.Body>
      {inHeaderElement && inHeaderElement}
    </CardBootstrap.Body>
  )
}
