import { useEffect, useState } from "react"
import { ProfileMember } from "../db"
import { LabeledIcon, TitledSectionCard } from "../shared"

type ProfileMemberPlus = (ProfileMember & { title: string }) | undefined

const DisplayLegislator = ({
  legislator
}: {
  legislator?: ProfileMemberPlus
}) => {
  const [idphoto, setIdphoto] = useState<string>("leaf-asset.png")

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
        <div>No legislator information given</div>
      )}
    </>
  )
}

export function ProfileLegislators({
  rep,
  senator,
  className
}: {
  rep?: ProfileMember
  senator?: ProfileMember
  className?: string
}) {
  return (
    <TitledSectionCard title={`Legislators`} className={className}>
      <DisplayLegislator
        legislator={{ ...rep, title: "Representative" } as ProfileMemberPlus}
      />
      <hr></hr>
      <DisplayLegislator
        legislator={{ ...senator, title: "Senator" } as ProfileMemberPlus}
      />
    </TitledSectionCard>
  )
}
