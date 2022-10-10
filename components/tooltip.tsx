import "@fortawesome/fontawesome-svg-core/styles.css"
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"

export const QuestionTooltip = ({ text }: { text: string }) => {
  return (
    <OverlayTrigger
      placement="auto"
      overlay={
        <Tooltip id="tooltip-text">
          <p>{text}</p>
        </Tooltip>
      }
    >
      <span className="m-1">
        <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
      </span>
    </OverlayTrigger>
  )
}
