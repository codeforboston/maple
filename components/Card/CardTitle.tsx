import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"

interface CardTitleProps {
  header?: string
  subheader?: string
  timestamp?: string
  imgSrc?: string
  imgTitle?: string
  inHeaderElement?: ReactElement
}

export const CardTitle = (props: CardTitleProps) => {
  const { header, subheader, timestamp, imgSrc, imgTitle, inHeaderElement } =
    props
  return (
    <CardBootstrap.Body
      className={`align-items-center bg-secondary d-flex text-white`}
    >
      <div className="justify-content-middle d-flex flex-column align-items-center">
        {imgSrc && <img alt="" src={imgSrc} width="75" height="75" />}
        <div className="mt-1">{imgTitle}</div>
      </div>
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
