import { ProfileMember, useMember } from "../db"
import { useEffect, useState } from "react"
import { Col, Container, Row } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ProfileLegislators.module.css"
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
  senator
}: {
  rep?: ProfileMember
  senator?: ProfileMember
}) {
  return (
    <TitledSectionCard title={`Legislators`}>
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
