import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"
import { Col } from "../bootstrap"
import styles from "./CardTitle.module.css"

interface CardTitleProps {
  header?: string
  subheader?: string
  timestamp?: string
  imgSrc?: string
  inHeaderElement?: ReactElement
}

export const CardTitle = (props: CardTitleProps) => {
  const { header, subheader, timestamp, imgSrc, inHeaderElement } = props
  return (
    <CardBootstrap.Body className={`${styles.text} ${styles.body}`}>
      {imgSrc && <CardBootstrap.Img className={styles.img} src={imgSrc} />}
      <Col className="w-auto">
        <CardBootstrap.Body>
          {header && (
            <CardBootstrap.Title className={styles.title}>
              {header}
            </CardBootstrap.Title>
          )}
          {subheader && (
            <CardBootstrap.Text className={styles.subheader}>
              {subheader}
            </CardBootstrap.Text>
          )}
        </CardBootstrap.Body>
      </Col>
      <Col className="col-sm-1 d-flex align-center ms-auto">
        <CardBootstrap.Body>
          {timestamp && (
            <CardBootstrap.Text className={styles.timestamp}>
              {timestamp}
            </CardBootstrap.Text>
          )}
        </CardBootstrap.Body>
      </Col>
      {inHeaderElement && inHeaderElement}
    </CardBootstrap.Body>
  )
}
