import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spinner } from "react-bootstrap"
import styled from "styled-components"
import { usePublishState } from "./hooks"
import { SyncState } from "./redux"

export const SyncStatus = styled(({ ...rest }) => {
  const state = usePublishState().sync
  const content = getContent(state),
    label = getLabel(state)
  return (
    <div {...rest}>
      <span className="me-1 text-muted">{label}</span>
      {content}
    </div>
  )
})`
  min-height: 1.5rem;
  font-size: 0.75rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .spinner-border {
    border-width: 0.2rem;
    width: 1rem;
    height: 1rem;
  }

  .unsaved {
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    margin: 0.25rem;
    background-color: var(--bs-orange);
    border-radius: 50%;
  }

  .fa-icon {
    width: 1rem;
    height: 1rem;
  }
`

const getLabel = (state: SyncState) => {
  switch (state) {
    case "error":
      return "Error Saving, Please Reload."
    case "loading":
      return "Draft Saving..."
    case "synced":
      return "Draft Saved"
    case "unsaved":
      return "Unsaved Changes"
  }
}
const getContent = (state: SyncState) => {
  switch (state) {
    case "error":
      return (
        <FontAwesomeIcon icon={faCheckCircle} className="text-danger fa-icon" />
      )
    case "loading":
      return <Spinner animation="border" variant="secondary" />
    case "synced":
      return (
        <FontAwesomeIcon
          icon={faCheckCircle}
          className="text-success fa-icon"
        />
      )
    case "unsaved":
      return <span className="unsaved" />
  }
}
