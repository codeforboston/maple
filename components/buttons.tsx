import React from "react"
import { Button } from "./bootstrap"

export const TableButton = ({
  onclick,
  children
}: {
  onclick?: () => void
  children: React.ReactElement
}) => {
  return (
    <Button variant="primary" className="m-1" onClick={onclick}>
      {children}
    </Button>
  )
}
