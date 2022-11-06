import React from "react"

export const Positions = (props: {
  endorseCount: number
  opposeCount: number
  neutralCount: number
}) => {
  return (
    <div>
      {props.endorseCount} {props.neutralCount} {props.opposeCount}
    </div>
  )
}
