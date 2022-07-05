import {
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  ReactNode
} from "react"
import styled from "styled-components"
import { Image } from "../bootstrap"
import { BillProps } from "./types"
import { LabeledContainer } from "./LabeledContainer"
import { External } from "../links"
import { Cosponsors } from "./Cosponsors"
import { FC } from "../types"

export const SponsorsAndCommittees: FC<BillProps> = ({ bill, className }) => {
  return (
    <LabeledContainer className={className}>
      <Sponsors bill={bill} />
      <Committees bill={bill} />
    </LabeledContainer>
  )
}

const Committees: FC<BillProps> = ({ bill }) => {
  const current = bill.currentCommittee
  if (!current) return null
  return (
    <div>
      <div className="title">Committee</div>
      <div className="d-flex justify-content-around">
        <Item
          label="Committee"
          href={`https://malegislature.gov/Committees/Detail/${current.id}`}
          name={current.name}
        />
      </div>
    </div>
  )
}

const Sponsors: FC<BillProps> = ({ bill, className }) => {
  const primary = bill.content.PrimarySponsor
  const cosponsors = bill.content.Cosponsors.filter(s => s.Id !== primary.Id)
  const more = cosponsors.length > 2

  return (
    <div className={className}>
      <div className="d-flex justify-content-between">
        <div className="title">Sponsors</div>
        {more && (
          <Cosponsors bill={bill}>
            See all {bill.cosponsorCount} Sponsors
          </Cosponsors>
        )}
      </div>
      <div className="mt-2 mb-2 d-flex justify-content-around">
        <Item
          label="Lead Sponsor"
          href={`https://malegislature.gov/Legislators/Profile/${primary.Id}`}
          name={primary.Name}
        />
        {bill.content.Cosponsors.slice(0, 2).map(s => (
          <Item
            key={s.Id}
            label="Sponsor"
            href={`https://malegislature.gov/Legislators/Profile/${s.Id}`}
            name={s.Name}
          />
        ))}
      </div>
    </div>
  )
}

const Styled = {
  Item: styled.div`
    font-size: 0.75rem;
    a {
      color: var(--bs-blue);
    }
    .label {
      font-weight: bold;
    }
    .content {
      max-width: 15rem;
    }
  `
}

const Item: FC<{
  label: string
  name: string
  href: string
}> = ({ label, name, href, className }) => {
  return (
    <Styled.Item className={` ${className}`}>
      <div className="label">{label}</div>
      <div className="content">
        <External href={href}>{name}</External>
      </div>
    </Styled.Item>
  )
}
