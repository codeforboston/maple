import "@fortawesome/fontawesome-svg-core/styles.css"
import { faInfo, faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useId } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"

export const QuestionTooltip = ({ text }: { text: string }) => {
  return (
    <OverlayTrigger
      placement="auto"
      overlay={
        <Tooltip id="tooltip-text">
          <div>{text}</div>
        </Tooltip>
      }
    >
      <span className="m-1">
        <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
      </span>
    </OverlayTrigger>
  )
}

/** As QuestionTooltip, with an "i" for the "?" and its colours reversed: the
 * same blue on white, in a ring of that blue the size of QuestionTooltip's
 * circle. It takes keyboard focus, which shows the tooltip, and its text is
 * its label. */
export const InfoTooltip = ({ text }: { text: string }) => {
  const id = useId()
  return (
    <OverlayTrigger
      placement="auto"
      overlay={
        <Tooltip id={id}>
          <div>{text}</div>
        </Tooltip>
      }
    >
      <span
        className="m-1"
        role="img"
        tabIndex={0}
        aria-label={text}
        style={infoRingStyle}
      >
        <FontAwesomeIcon icon={faInfo} style={{ fontSize: "0.55em" }} />
      </span>
    </OverlayTrigger>
  )
}

const infoRingStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
  width: "1em",
  height: "1em",
  boxSizing: "border-box",
  borderRadius: "50%",
  border: "1.5px solid var(--bs-secondary)",
  background: "var(--maple-surface-base)",
  color: "var(--bs-secondary)",
  verticalAlign: "-0.125em"
}
