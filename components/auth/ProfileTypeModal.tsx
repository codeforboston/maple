import { faBullhorn } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Stack, Image } from "../bootstrap"
import { OutlineButton } from "../buttons"
import styled from "styled-components"
import { useTranslation } from "next-i18next"

/* The two cards side by side in the large dialog (lg, 800px from 992px), as
   they always were; one above the other below that, where the dialog is 500px
   or the phone's width. */
const CardRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const StyledButton = styled(Button)`
  width: 100%;
  margin: 0;
  text-align: left;
  /* Its content from the top rather than centred, as a button centres it, so
     the two cards' icons line up whatever the length of their text. */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  /* As much room above its content as beside it (the button's side
     padding), and a little more below. No set height: the card is as tall as
     its content, and both cards match, as the row sizes them to the taller. */
  padding-top: var(--maple-space-xl);
  padding-bottom: 2rem;

  p {
    font-size: 16px;
    margin: 0;
  }

  /* The icon and the title side by side, centred on each other, with the
     line under them running the card's full width. */
  .card-head {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  /* Each card's title (Individual, Organization): larger than the line under
     it, and lighter than the button's bold, in the site's Lexend. */
  .user-type {
    font-size: 1.125rem;
    font-weight: 500;
  }

  /* The line under each title in Nunito rather than the site's Lexend, a step
     lighter than the button's bold (Nunito loads 300, 400, 500 and 700). */
  .description {
    font-family: var(--maple-font-body);
    font-size: 1rem;
    font-weight: 500;
  }

  /* Both icons at 48px, down from the person icon's own 60px
     (profile-individual-white.svg). */
  .card-head img,
  .org-icon {
    width: 48px;
    height: 48px;
  }

  /* The organization's bullhorn in a white circle, the size of the person
     icon. The bullhorn takes the card's own colour, through hover and press,
     so it reads as cut out of the circle as the person is. */
  .org-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #fff;
    color: var(--bs-btn-bg);
    font-size: 1.4rem;
  }

  &:hover .org-icon,
  &:focus-visible .org-icon {
    color: var(--bs-btn-hover-bg);
  }

  &:active .org-icon {
    color: var(--bs-btn-active-bg);
  }

  /* Phones, where the dialog runs the screen's width: the titles, the line
     under them and the icons a size down. */
  @media (max-width: 575.98px) {
    .user-type {
      font-size: 1rem;
    }

    .description {
      font-size: 0.9375rem;
    }

    .card-head img,
    .org-icon {
      width: 40px;
      height: 40px;
    }

    .org-icon {
      font-size: 1.15rem;
    }
  }

  Image {
    margin: 0;
  }
`

export default function ProfileTypeModal({
  show,
  onHide,
  onIndividualUserClick,
  onOrgUserClick
}: Pick<ModalProps, "show" | "onHide"> & {
  onHide: () => void
  onIndividualUserClick: () => void
  onOrgUserClick: () => void
}) {
  const { t } = useTranslation("auth")

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="sign-up-modal"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="sign-up-modal">{t("signUp")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={12} className="mx-auto">
          <Stack gap={2} direction="vertical">
            <h2>{t("registerAs")}</h2>
            <CardRow>
              <StyledButton
                type="button"
                variant="secondary"
                onClick={onIndividualUserClick}
              >
                <div className="card-head">
                  <Image alt="" src="/profile-individual-white.svg" />
                  <p className="user-type">{t("individualUser")}</p>
                </div>
                <p className="description">{t("individualDescription")}</p>
              </StyledButton>

              <StyledButton
                type="button"
                variant="secondary"
                onClick={onOrgUserClick}
              >
                <div className="card-head">
                  <span className="org-icon">
                    <FontAwesomeIcon icon={faBullhorn} />
                  </span>
                  <p className="user-type">{t("org")}</p>
                </div>
                <p className="description">{t("orgDescription")}</p>
              </StyledButton>
            </CardRow>
            <p>{t("orgVetting")}</p>
            <hr />
            {/* Coloured as the Settings dialog's secondary Cancel
                (components/EditProfilePage/ProfileSettingsModal.tsx), at this
                dialog's own size. */}
            <OutlineButton
              className="btn-bg-white"
              onClick={onHide}
              label={t("cancel")}
            />
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
