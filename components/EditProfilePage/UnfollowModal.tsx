import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import { Button, Modal, Stack } from "../bootstrap"
import { formatBillId } from "../formatting"
import { UnfollowModalConfig } from "./FollowingTab"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  handleUnfollowClick: (unfollow: UnfollowModalConfig | null) => Promise<void>
  onUnfollowClose: () => void
  unfollow: UnfollowModalConfig | null
}

const StyledButton = styled(Button)`
  width: 110px;
`

const StyledModalBody = styled(Modal.Body)`
  padding: 0.8rem;
`

export default function unfollow({
  handleUnfollowClick,
  onHide,
  onUnfollowClose,
  show,
  unfollow
}: Props) {
  const handleTopic = () => {
    if (unfollow?.type == "bill") {
      return ` Bill ${formatBillId(unfollow?.typeId)}`
    } else {
      return ` ${unfollow?.orgName}`
    }
  }

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
            onClick={onUnfollowClose}
          >
            No
          </StyledButton>
          <StyledButton
            className={`
                btn btn-sm ms-3 me-auto py-1`}
            onClick={async () => {
              handleUnfollowClick(unfollow)
            }}
          >
            Yes
          </StyledButton>
        </Stack>
      </StyledModalBody>
    </Modal>
  )
}
