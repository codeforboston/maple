import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import { Button, Modal, Stack } from "../bootstrap"
import { formatBillId } from "../formatting"
import { useTranslation } from "next-i18next"

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

export default function UnfollowItem({
  handleUnfollowClick,
  onHide,
  onUnfollowClose,
  show,
  unfollow
}: Props) {
  const { t } = useTranslation("editProfile")
  const handleTopic = () => {
    if (unfollow?.type == "bill") {
      return ` Bill ${formatBillId(unfollow?.typeId)}`
    } else if (unfollow?.type == "org") {
      return ` ${unfollow?.orgName}`
    } else {
      // throw new Error(`Unexpected type: ${unfollow?.type}`);
      return "" // DEBUG: not returning a string here causes the modal to crash
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
        <Modal.Title id="unfollow-modal">{t("follow.unfollow")}</Modal.Title>
      </Modal.Header>
      <StyledModalBody className={`ms-auto me-auto`}>
        <Stack>
          {t("confirmation.unfollowMessage")}
          {handleTopic()}?
        </Stack>
        <Stack className={`mt-4`} direction={`horizontal`}>
          <StyledButton
            className={`
                btn btn-sm btn-outline-secondary ms-auto py-1`}
            onClick={onUnfollowClose}
          >
            {t("confirmation.no")}
          </StyledButton>
          <StyledButton
            className={`
                btn btn-sm ms-3 me-auto py-1`}
            onClick={async () => {
              handleUnfollowClick(unfollow)
            }}
          >
            {t("confirmation.yes")}
          </StyledButton>
        </Stack>
      </StyledModalBody>
    </Modal>
  )
}
