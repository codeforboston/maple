import React, { useState } from "react"
import Button from "react-bootstrap/Button"
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
    <Button
      onClick={() => {
        onClick(seeMore)
        setSeeMore(seeMore === "SEE_MORE" ? "SEE_LESS" : "SEE_MORE")
      }}
      variant="outline-dark"
    >
      <CardBootstrap.Text
        className={`fs-6 lh-sm text-center text-decoration-underline`}
      >
        {LABEL_ENUM[seeMore]}
      </CardBootstrap.Text>
    </Button>
  )
}
