import { Card, SeeMore } from "components/Card"
import { Key, useState } from "react"
import { OrgAvatar } from "stories/components/OrgAvatar"
import styled from "styled-components"

interface OrgProps {
  header: string
  subheader: string
  orgs?: any
}
const Wrapper = styled.div`
  width: 635px;
  display: grid;

  .cardBody {
    flex-wrap: wrap;
    display: flex;
    justify-content: space-around;
    align-content: space-around;
  }
  .solid {
    border-top: 2px solid var(--bs-gray-700);
  }
`
interface OrgItem {
  id: Key | null | undefined
  name: string
  orgImageSrc: string
  stanceTitle: string
}

export const OrgPriorityCard = (props: OrgProps) => {
  const [orgsToDisplay, setOrgsToDisplay] = useState<OrgItem[] | undefined>(
    props.orgs?.slice(0, 3)
  )

  const handleSeeMoreClick = (event: string): void => {
    if (event === "SEE_MORE") {
      setOrgsToDisplay(props.orgs)
      return
    }
    setOrgsToDisplay(props.orgs?.slice(0, 3))
  }
  return (
    <Wrapper>
      <Card
        header={props.header}
        subheader={props.subheader}
        bodyText={
          <>
            <div className="cardBody">
              {props.orgs.map(
                (org: {
                  id: Key | null | undefined
                  name: string
                  orgImageSrc: string
                  stanceTitle: string
                }) => {
                  return (
                    <OrgAvatar
                      key={org.id}
                      name={org.name}
                      orgImageSrc={org.orgImageSrc}
                      stanceTitle={org.stanceTitle}
                    />
                  )
                }
              )}
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
