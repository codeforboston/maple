import { Card, SeeMore } from "components/Card"
import { Position } from "components/db"
import { Key, useState } from "react"
import { OrgAvatar } from "stories/components/OrgAvatar"
import styled from "styled-components"

export interface OrgItem {
  id: Key | null | undefined
  name: string
  orgImageSrc: string
  position: Position
}
interface OrgProps {
  header: string
  subheader: string
  orgs?: Array<OrgItem>
}
const Wrapper = styled.div`
  width: fit-content;
  display: grid;

  .cardBody {
    flex-wrap: wrap;
    display: flex;
    justify-content: flex-start;
    padding: 0rem;
  }
  .solid {
    border-top: 2px solid var(--bs-gray-700);
    padding: 0rem;
  }
`

export const OrgPriorityCard = (props: OrgProps) => {
  const [orgsToDisplay, setOrgsToDisplay] = useState<OrgItem[] | undefined>(
    props.orgs?.slice(0, 4)
  )

  const handleSeeMoreClick = (event: string): void => {
    if (event === "SEE_MORE") {
      setOrgsToDisplay(props.orgs)
      return
    }
    setOrgsToDisplay(props.orgs?.slice(0, 4))
  }
  return (
    <Wrapper>
      <Card
        header={props.header}
        subheader={props.subheader}
        bodyText={
          <>
            <div className="cardBody">
              {orgsToDisplay?.map(org => {
                return (
                  <OrgAvatar
                    key={org.id}
                    name={org.name}
                    orgImageSrc={org.orgImageSrc}
                    position={org.position}
                  />
                )
              })}
            </div>
            <hr className="solid" />{" "}
            {props.orgs?.length && props.orgs?.length > 4 && (
              <SeeMore onClick={handleSeeMoreClick} />
            )}
          </>
        }
      />
    </Wrapper>
  )
}
