import { useEffect, useState } from "react"
import { ProfileMember } from "../db"
import { LabeledIcon, TitledSectionCard } from "../shared"
import { Card as MapleCard } from "components/Card"
import { useTranslation } from "next-i18next"
import { useTranslation } from "next-i18next"

type ProfileMemberPlus = (ProfileMember & { title: string }) | undefined

const DisplayLegislator = ({
  legislator
}: {
  legislator?: ProfileMemberPlus
}) => {
  const [idphoto, setIdphoto] = useState<string>("/leaf.svg")
  const { t } = useTranslation("profile")
  const { t } = useTranslation("profile")

  useEffect(() => {
    setIdphoto(
      `https://malegislature.gov/Legislators/Profile/170/${legislator?.id}.jpg`
    )
  }, [legislator?.id])

  return (
    <>
      {legislator ? (
        <LabeledIcon
          idImage={idphoto}
          mainText={legislator.title}
          subText={legislator.name}
        />
      ) : (
        <div>{t("content.noLegislatorInfo")}</div>
      )}
    </>
  )
}

type ProfileLegislatorsProps = {
  rep?: ProfileMember
  senator?: ProfileMember
  className?: string
}

export function ProfileLegislators({
  rep,
  senator,
  className
}: ProfileLegislatorsProps) {
  const { t } = useTranslation("profile")
  const { t } = useTranslation("profile")
  return (
    <TitledSectionCard title={t("legislators").toString()} className={className}>
      <div>
        <DisplayLegislator
          legislator={{ ...rep, title: t("legislator.representative") } as ProfileMemberPlus}
        />
        <DisplayLegislator
          legislator={{ ...senator, title: t("legislator.senator") } as ProfileMemberPlus}
        />
      </div>
    </TitledSectionCard>
  )
}
