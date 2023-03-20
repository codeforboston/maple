import { format, fromUnixTime } from "date-fns"
import styled from "styled-components"
import { Row } from "../bootstrap"
import { External } from "../links"
import { LabeledIcon } from "../shared"
import { FC } from "../types"
import { Cosponsors } from "./Cosponsors"
import { LabeledContainer } from "./LabeledContainer"
import styles from "./SponsorsAndCommittees.module.css"
import { BillProps } from "./types"

const HearingDate = styled.div`
  font-weight: 500;
  font-size: 22px;
  line-height: 125%;

  text-align: center;
  color: #ffffff;

  align-self: stretch;
  max-width: 202px;
`

export const Committees: FC<BillProps> = ({ bill, className }) => {
  const current = bill.currentCommittee
  if (!current) return null
  return (
    <LabeledContainer className={className}>
      <Row className={`bg-secondary text-light ${styles.subHeader}`}>
        Committee
      </Row>
      <div className={`d-flex justify-content-around`}>
        <LabeledIcon
          idImage={`https://www.thefreedomtrail.org/sites/default/files/styles/image_width__720/public/content/slider-gallery/bulfinch_front.png?itok=kY2wLdnk`} // may want a better image or on our server
          // mainText="Committee"
          mainText=""
          subText={
            <External
              href={`https://malegislature.gov/Committees/Detail/${current.id}`}
            >
              {current.name}
            </External>
          }
        />
      </div>
    </LabeledContainer>
  )
}

export const Hearing: FC<BillProps> = ({ bill, className }) => {
  return (
    <>
      {!bill.nextHearingAt?.seconds ? null : (
        <LabeledContainer className={className}>
          <HearingDate>
            Hearing Scheduled for{" "}
            {bill.nextHearingAt?.seconds
              ? format(fromUnixTime(bill.nextHearingAt?.seconds), "MMM d, y p")
              : null}
          </HearingDate>
        </LabeledContainer>
      )}
    </>
  )
}

export const Sponsors: FC<BillProps> = ({ bill, className }) => {
  const primary = bill.content?.PrimarySponsor
  const cosponsors = bill.content.Cosponsors.filter(s => s.Id !== primary?.Id)
  const more = cosponsors.length > 2

  return (
    <LabeledContainer className={className}>
      <Row className={`bg-secondary text-light ${styles.subHeader}`}>
        Sponsors
      </Row>
      <div className={className}>
        <div
          className={`
            mt-2 pb-3 d-flex justify-content-right 
            ${more ? styles.borderBottom : ""}
          `}
        >
          {primary && (
            <LabeledIcon
              idImage={`https://malegislature.gov/Legislators/Profile/170/${primary.Id}.jpg`}
              mainText="Lead Sponsor"
              subText={
                <External
                  href={`https://malegislature.gov/Legislators/Profile/${primary.Id}`}
                >
                  {primary.Name}
                </External>
              }
            />
          )}

          {bill.content.Cosponsors.filter(s => s.Id !== primary?.Id)
            .slice(0, 2)
            .map(s => (
              <LabeledIcon
                key={s.Id}
                idImage={`https://malegislature.gov/Legislators/Profile/170/${s.Id}.jpg`}
                mainText="Sponsor"
                subText={
                  <External
                    href={`https://malegislature.gov/Legislators/Profile/${s.Id}`}
                  >
                    {s.Name}
                  </External>
                }
              />
            ))}
        </div>
        <div className="d-flex justify-content-center">
          {more && (
            <Cosponsors bill={bill}>
              See {bill.cosponsorCount} Sponsors
            </Cosponsors>
          )}
        </div>
      </div>
    </LabeledContainer>
  )
}
