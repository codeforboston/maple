import { Card, SeeMore } from "components/Card"
import { Position } from "common/testimony/types"
import { Key } from "react"
import { OrgAvatar } from "./OrgAvatar"
import styled from "styled-components"
import { FC } from "react"
import { chunk } from "lodash"

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
    display: flex;
    justify-content: flex-start;
    overflow-x: auto;
  }

  .solid {
    border-top: 2px solid var(--bs-gray-700);
    padding: 0rem;
  }
`

const OrgRow: FC<{ orgs: OrgItem[] }> = ({ orgs }) => {
  return (
    <div className="cardBody m-2">
      {orgs?.map(org => {
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
  )
}

export const OrgPriorityCard: FC<OrgProps> = props => {
  return (
    <Wrapper>
      <Card
        header={props.header}
        subheader={props.subheader}
        initialRowCount={1}
        items={chunk(props.orgs, 4).map((orgsForRow, key) => (
          <OrgRow key={key} orgs={orgsForRow} />
        ))}
      />
    </Wrapper>
  )
}
