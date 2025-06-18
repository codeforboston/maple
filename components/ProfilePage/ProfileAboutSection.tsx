import { Profile } from "common/profile/types"
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
  isOrg: boolean
}) => {
  const {
    twitter,
    linkedIn,
    instagram,
    fb,
    blueSky,
    mastodon
  }: {
    twitter?: string
    linkedIn?: string
    instagram?: string
    fb?: string
    blueSky?: string
    mastodon?: string
  } = profile?.social ?? {}
  const { t } = useTranslation("profile")
  const title = isOrg
    ? t("aboutUs")
    : t("aboutMe", {
      firstName: profile?.fullName?.split(" ")?.[0] ?? "User"
    })

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
            blueSky={blueSky}
            mastodon={mastodon}
          />
        ) : (
          <></>
        )
      }
    >
      <div>{profile?.about ?? ""}</div>
    </TitledSectionCard>
  )
}
