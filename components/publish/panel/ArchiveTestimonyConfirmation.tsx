import { UseAsyncReturn } from "react-async-hook"
import styled from "styled-components"
import { Button, Spinner, Collapse } from "react-bootstrap"

export const ArchiveTestimonyConfirmation = styled<{
  show: boolean
  onHide: () => void
  archiveTestimony: UseAsyncReturn<void, []> | undefined
}>(({ show, onHide, archiveTestimony, ...props }) => {
  return (
    <Collapse in={show}>
      <div>
        <div {...props}>
          <div>Are you sure you want to delete your testimony?</div>
          <div className="d-flex justify-content-center mt-2">
            <Button
              className="choice me-4"
              variant="success"
              onClick={archiveTestimony?.execute}
              disabled={
                archiveTestimony === undefined || archiveTestimony.loading
              }
            >
              {archiveTestimony?.loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Yes"
              )}
            </Button>
            <Button className="choice" variant="info" onClick={onHide}>
              No
            </Button>
          </div>
        </div>
      </div>
    </Collapse>
  )
})`
  font-size: 0.75rem;
  .choice {
    font-size: inherit;
    padding: 0.2rem 0.5rem 0.2rem 0.5rem;
    border-radius: 0.75rem;
    color: white;
    display: flex;
    align-items: center;
  }
`
