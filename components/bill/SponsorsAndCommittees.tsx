import styled from "styled-components"
import { Image } from "../bootstrap"
import { BillProps } from "./types"
import { LabeledContainer } from "./LabeledContainer"
import { External } from "../links"
import { Cosponsors } from "./Cosponsors"
import { FC } from "../types"
import { LabeledIcon, TitledSectionCard } from "../shared"

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
        <LabeledIcon
          idImage={`https://www.thefreedomtrail.org/sites/default/files/styles/image_width__720/public/content/slider-gallery/bulfinch_front.png?itok=kY2wLdnk`} // may want a better image or on our server
          mainText="Committee"
          subText={current.name} // can this be link? {`https://malegislature.gov/Committees/Detail/${current.id}`}
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
      <div className="mt-2 mb-2 d-flex justify-content-right">
        <LabeledIcon
          idImage={`https://malegislature.gov/Legislators/Profile/170/${primary.Id}.jpg`}
          mainText="Lead Sponsor"
          subText={primary.Name} // can this be link? href={`https://malegislature.gov/Legislators/Profile/${primary.Id}`}
        />

        {bill.content.Cosponsors.slice(0, 2).map(s => (
          <>
            <LabeledIcon
              idImage={`https://malegislature.gov/Legislators/Profile/170/${s.Id}.jpg`}
              mainText="Sponsor"
              subText={s.Name} // can this be link? href={`https://malegislature.gov/Legislators/Profile/${s.Id}`}
            />
          </>
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
