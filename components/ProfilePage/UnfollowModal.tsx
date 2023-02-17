import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import { Button, Modal, Stack } from "../bootstrap"
import { formatBillId } from "../formatting"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  currentCourt: number
  currentOrgName: string
  currentType: string
  currentTypeId: string
  handleUnfollowClick: (
    courtId: number,
    type: string,
    typeId: string
  ) => Promise<void>
  onUnfollowModalClose: () => void
}

const StyledButton = styled(Button)`
  width: 110px;
`

const StyledModalBody = styled(Modal.Body)`
  padding: 0.8rem;
`

export default function UnfollowModal({
  currentCourt,
  currentOrgName,
  currentType,
  currentTypeId,
  handleUnfollowClick,
  onHide,
  onUnfollowModalClose,
  show
}: Props) {
  const handleTopic = () => {
    if (currentType == "bill") {
      return ` Bill ${formatBillId(currentTypeId)}`
    } else {
      return ` ${currentOrgName}`
    }
  }

  console.log("Type", currentType)
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
          Are you sure you want to unfollow
          {handleTopic()}?
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
              handleUnfollowClick(currentCourt, currentType, currentTypeId)
            }}
          >
            Yes
          </StyledButton>
        </Stack>
      </StyledModalBody>
    </Modal>
  )
}
