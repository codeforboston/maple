import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"

interface AlertCardBodyProps {
  imgSrc?: string
  imgAltTxt?: string
  text: string
}

export const AlertCardBody = (props: AlertCardBodyProps) => {
  const { imgSrc, imgAltTxt, text } = props
  return (
    <div>
      {imgSrc && <img src={imgSrc} width="100%" alt={imgAltTxt}></img>}
      <CardBootstrap.Body>
        <CardBootstrap.Text>{text}</CardBootstrap.Text>
      </CardBootstrap.Body>
    </div>
  )
}
