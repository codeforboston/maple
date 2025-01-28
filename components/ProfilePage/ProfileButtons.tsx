import { useTranslation } from "next-i18next"
import React, { useContext } from "react"
import styled from "styled-components"
import { FillButton, GearIcon, OutlineButton } from "../buttons"
import { Button } from "../bootstrap"
import { Role } from "components/auth/types"
import { Internal } from "components/links"
import { TabContext } from "components/shared/ProfileTabsContext"

export const StyledButton = styled(Button).attrs(props => ({
  className: `col-12 d-flex align-items-center justify-content-center py-3 text-nowrap`,
  size: "lg"
}))`
  height: 34px;
  /* width: 116px; */

  @media (max-width: 768px) {
    position: relative;
    width: 100%;
    /* top: -9px; */
  }
`

type Props = {
  formUpdated: boolean
  uid: string
  role: Role
}

export const ProfileEditToggle = ({ formUpdated, uid, role }: Props) => {
  const { t } = useTranslation(["editProfile"])
  return (
    <FillButton
      disabled={!!formUpdated}
      href={`/profile?id=${uid}`}
      label={
        role === "organization" || role === "pendingUpgrade"
          ? t("viewOrgProfile")
          : t("viewMyProfile")
      }
    />
  )
}

export const EditProfileButton = ({
  className,
  handleClick,
  tab
}: {
  className?: string
  handleClick?: any
  tab: string
}) => {
  const { t } = useTranslation("profile")

  return (
    <Internal
      href="/editprofile"
      className={`text-decoration-none text-white d-flex justify-content-center align-items-center col-12 ${className}`}
    >
      <FillButton
        label={t(tab)}
        onClick={handleClick}
        className={`${tab == "button.followedContent" ? `btn-secondary` : ``}`}
      />
    </Internal>
  )
}

export function ProfileButtons({
  isUser,
  hideTestimonyButton,
  onSettingsModalOpen
}: {
  isUser: boolean
  hideTestimonyButton: boolean
  onSettingsModalOpen: () => void
}) {
  const { t } = useTranslation("editProfile")

  const { tabStatus, setTabStatus } = useContext(TabContext)

  return (
    <>
      {isUser ? (
        <div className={`d-grid gap-2 col-12 m-3`}>
          <EditProfileButton
            className={`py-1`}
            handleClick={() => {
              setTabStatus("Following")
            }}
            tab={"button.followedContent"}
          />
          {hideTestimonyButton ? (
            <></>
          ) : (
            <EditProfileButton
              className={`py-1`}
              handleClick={() => {
                setTabStatus("Testimonies")
              }}
              tab={"button.yourTestimonies"}
            />
          )}
          <OutlineButton
            className={`py-1`}
            label={t("settings")}
            Icon={GearIcon}
            onClick={() => onSettingsModalOpen()}
          />
        </div>
      ) : null}
    </>
  )
}
