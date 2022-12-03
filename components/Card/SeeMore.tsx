import clsx from "clsx"
import React, { useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styles from "./SeeMore.module.css"

interface SeeMoreProps {
  onClick?: (event: string) => void
  className?: string
}

export const SeeMore = (props: SeeMoreProps) => {
  const { onClick = () => {} } = props
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
      className={clsx(styles.container, props.className)}
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
