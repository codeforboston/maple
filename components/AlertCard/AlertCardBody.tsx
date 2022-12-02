import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styles from "./AlertCard.module.css"

interface AlertCardBodyProps {
  imgSrc?: string
  imgAltTxt?: string
  text: string
}

export const AlertCardBody = (props: AlertCardBodyProps) => {
    const { imgSrc, imgAltTxt, text} = props
    return (
        imgSrc ? (
            <div>
              <img src={imgSrc} width="100%" alt={imgAltTxt}></img>
                <CardBootstrap.Text className={styles.body}>
                  {text}
                </CardBootstrap.Text>
            </div>
        ) : (
            <CardBootstrap.Body>
                <CardBootstrap.Text className={styles.body}>
                    {text}
                </CardBootstrap.Text>
            </CardBootstrap.Body>
        )

    )
}
