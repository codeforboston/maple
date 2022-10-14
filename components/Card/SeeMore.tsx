import React, { useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styles from "./SeeMore.module.css"

interface SeeMoreProps {
  onClick: (event: string) => void
}

export const SeeMore = (SeeMoreProps: SeeMoreProps): typeof SeeMore => {
  const { onClick } = SeeMoreProps
  const [seeMore, setSeeMore] = useState<string>("SEE_MORE")
  const LABEL_ENUM: Record<string, string> = {
    SEE_MORE: "See More",
    SEE_LESS: "See Less"
  }
  return (
    <CardBootstrap.Body
      onClick={() => {
        onClick(seeMore)
        setSeeMore(seeMore === "SEE_MORE" ? "SEE_LESS" : "SEE_MORE")
      }}
      className={styles.container}
    >
      <CardBootstrap.Text
        style={{
          textDecoration: "underline",
          fontFamily: "Nunito",
          fontStyle: "normal",
          fontWeight: 600,
          fontSize: "12px",
          lineHeight: "125%"
        }}
        className="text-center"
      >
        {LABEL_ENUM[seeMore]}
      </CardBootstrap.Text>
    </CardBootstrap.Body>
  )
}
