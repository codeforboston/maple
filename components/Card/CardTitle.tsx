import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"
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
        {timestamp && (
          <CardBootstrap.Text className={styles.timestamp}>
            {timestamp}
          </CardBootstrap.Text>
        )}
      </CardBootstrap.Body>
      {inHeaderElement && inHeaderElement}
    </CardBootstrap.Body>
  )
}
