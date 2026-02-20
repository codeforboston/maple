import type { ModalProps } from "react-bootstrap"
import { Modal } from "../bootstrap"
import { useTranslation } from "next-i18next"

export default function PhoneVerificationModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const { t } = useTranslation("editProfile")

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="phone-verification-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="phone-verification-modal">
          {t("phoneVerificationModalTitle")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Step 1 (phone) and step 2 (code) content will be added in step 3 */}
      </Modal.Body>
    </Modal>
  )
}
