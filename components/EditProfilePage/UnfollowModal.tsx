import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import { Button, Modal, Stack } from "../bootstrap"
import { formatBillId } from "../formatting"
import { useTranslation } from "next-i18next"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  handleUnfollowClick: ({
    uid,
    unfollowItem
  }: {
    uid: string | undefined
    unfollowItem: UnfollowModalConfig | null
  }) => Promise<void>
  onUnfollowClose: () => void
  uid: string | undefined
  unfollowItem: UnfollowModalConfig | null
}

export type UnfollowModalConfig = {
  court: number
  orgName: string
  type: string
  typeId: string
}

const StyledButton = styled(Button)`
  width: 110px;
`

const StyledModalBody = styled(Modal.Body)`
  padding: 0.8rem;
`

export default function unfollowItem({
  handleUnfollowClick,
  onHide,
  onUnfollowClose,
  show,
  uid,
  unfollowItem
}: Props) {
  const { t } = useTranslation("editProfile")
  const handleTopic = () => {
    if (unfollowItem?.type == "bill") {
      return ` Bill ${formatBillId(unfollowItem?.typeId)}`
    } else {
      return ` ${unfollowItem?.orgName}`
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
          {t("comfirmation.unfollowMessage")}
          {handleTopic()}?
        </Stack>
        <Stack className={`mt-4`} direction={`horizontal`}>
          <StyledButton
            className={`
                btn btn-sm btn-outline-secondary ms-auto py-1`}
            onClick={onUnfollowClose}
          >
            {t("comfirmation.no")}
          </StyledButton>
          <StyledButton
            className={`
                btn btn-sm ms-3 me-auto py-1`}
            onClick={async () => {
              handleUnfollowClick({ uid, unfollowItem })
            }}
          >
            {t("comfirmation.yes")}
          </StyledButton>
        </Stack>
      </StyledModalBody>
    </Modal>
  )
}
