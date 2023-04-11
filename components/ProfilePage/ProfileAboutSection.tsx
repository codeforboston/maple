import { Profile } from "../db"
import { TitledSectionCard } from "../shared"
import { SocialMediaIcons } from "./SocialMediaIcons"
import { useTranslation } from "next-i18next"

export const ProfileAboutSection = ({
  profile,
  className,
  isOrg
}: {
  profile: Profile
  className?: string
  isMobile?: boolean
  isOrg: boolean
}) => {
  const {
    twitter,
    linkedIn,
    instagram,
    fb
  }: { twitter?: string; linkedIn?: string; instagram?: string; fb?: string } =
    profile?.social ?? {}
  const { t } = useTranslation("profile")
  const title = isOrg
    ? t("aboutUs")
    : t("aboutMe", {firstName: profile?.displayName?.split(" ")?.[0] ?? "User"})

  return (
    <TitledSectionCard
      className={`${className} h-100`}
      title={title}
      footer={
        !isOrg ? (
          <SocialMediaIcons
            twitter={twitter}
            linkedIn={linkedIn}
            instagram={instagram}
            fb={fb}
          />
        ) : (
          <></>
        )
      }
    >
      <div>{profile?.about ?? t("content.statePurpose")}</div>
    </TitledSectionCard>
  )
}
