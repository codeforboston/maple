import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"    
import '@fortawesome/fontawesome-svg-core/styles.css'
import React from "react"
import {
  OverlayTrigger,
  OverlayTriggerProps,
  Tooltip,
  TooltipProps
} from "react-bootstrap"

const renderTooltip = ({
  text,
  props
}: {
  text: string
  props: TooltipProps
}) => {
  return (
    <Tooltip id="button-tooltip" {...props}>
      {text}
    </Tooltip>
  )
}

export const overlayTrigger = ({
  text,
  props
}: {
  text: string
  props: OverlayTriggerProps
}) => {
  const tooltip = () => renderTooltip({ text, props })

  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={tooltip}
    >
      <FontAwesomeIcon
        icon={faQuestionCircle}
        size={"sm"}
        className="m-2"
      />
    </OverlayTrigger>
  )
}
