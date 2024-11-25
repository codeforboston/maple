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

// newsfeed bill card title
export const CardTitleV2 = (props: CardTitleProps) => {
  const { header, subheader, timestamp, imgSrc, imgTitle, inHeaderElement } =
    props
  return (
    <CardBootstrap.Body className={`align-items-center d-flex `}>
      <div className="justify-content-middle d-flex flex-column align-items-center">
        {imgSrc && <img alt="" src={imgSrc} width="32" height="32" />}
        <div className="mt-1">{imgTitle}</div>
      </div>
      <CardBootstrap.Body className="px-3 py-0">
        {header && (
          <CardBootstrap.Title className={`align-items-start fs-6 lh-sm mb-1`}>
            {header}{" "}
            {subheader ? <>has an action update from the {subheader}</> : <></>}
          </CardBootstrap.Title>
        )}
        <CardBootstrap.Title
          className={`align-items-start fs-6 lh-sm mb-1 text-body-tertiary`}
        >
          {<>following query text here</>}
        </CardBootstrap.Title>
        {/* follow subline here? */}
      </CardBootstrap.Body>
    </CardBootstrap.Body>
  )
}
