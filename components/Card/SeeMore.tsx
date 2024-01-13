import clsx from "clsx"
import React, { useState } from "react"
import CardBootstrap from "react-bootstrap/Card"

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
      className={clsx(props.className) + `py-2`}
      style={{ cursor: "pointer" }}
    >
      <CardBootstrap.Text
        className={`fs-6 lh-sm text-center text-decoration-underline`}
      >
        {LABEL_ENUM[seeMore]}
      </CardBootstrap.Text>
    </CardBootstrap.Body>
  )
}
