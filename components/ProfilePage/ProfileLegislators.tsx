import TitledSectionCard from "../TitledSection/TitledSectionCard"
import { ProfileMember, useMember } from "../db"
import { useEffect, useState } from "react"
import { Col, Container, Row } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ProfileLegislators.module.css"

type ProfileMemberPlus = (ProfileMember & { title: string }) | undefined

const DisplayLegislator = ({
  legislator
}: {
  legislator?: ProfileMemberPlus
}) => {
  const [photo, setPhoto] = useState<string>("leaf-asset.png")
  // real photo blocked: not scraping photos to the database yet.

  return (
    <>
      {legislator ? (
        <Row className={`${styles.nowrap}`}>
          <Col
            className={`d-flex align-items-end justify-content-end`}
          >
            <div className={`${styles.legislatorPhoto}`}>
              <Image fluid src={photo} alt={`${legislator.name}`} />
            </div>
          </Col>
          <Col className="d-flex align-items-center col-7">
            <div className={`${styles.nowrap}`}>
              <h5 className="flex m-0"><strong>{legislator.title}</strong></h5>
              <p className="flex m-0">{legislator.name}</p>
            </div>
          </Col>
        </Row>
      ) : (
        <Col>No legislator information given</Col>
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
