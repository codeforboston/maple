import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import { Button, Modal, Stack } from "../bootstrap"
import { formatBillId } from "../formatting"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  currentBill: string
  currentCourt: number
  handleUnfollowClick: (billId: string, courtId: number) => Promise<void>
  onUnfollowModalClose: () => void
}

const StyledButton = styled(Button)`
  width: 110px;
`

const StyledModalBody = styled(Modal.Body)`
  padding: 0.8rem;
`

export default function UnfollowModal({
  currentBill,
  currentCourt,
  handleUnfollowClick,
  onHide,
  onUnfollowModalClose,
  show
}: Props) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="unfollow-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="unfollow-modal">Unfollow</Modal.Title>
      </Modal.Header>
      <StyledModalBody className={`ms-auto me-auto`}>
        <Stack>
          Are you sure you want to unfollow Bill {formatBillId(currentBill)}?
        </Stack>
        <Stack className={`mt-4`} direction={`horizontal`}>
          <StyledButton
            className={`
                btn btn-sm btn-outline-secondary ms-auto py-1`}
            onClick={onUnfollowModalClose}
          >
            No
          </StyledButton>
          <StyledButton
            className={`
                btn btn-sm ms-3 me-auto py-1`}
            onClick={async () => {
              handleUnfollowClick(currentBill, currentCourt)
            }}
          >
            Yes
          </StyledButton>
        </Stack>
      </StyledModalBody>
    </Modal>
  )
}
