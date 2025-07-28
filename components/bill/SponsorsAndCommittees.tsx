import { fromUnixTime } from "date-fns"
import { useTranslation } from "components/translations"
import styled from "styled-components"
import { Card, Container } from "../bootstrap"
import { External } from "../links"
import { LabeledIcon } from "../shared"
import { FC } from "../types"
import { Cosponsors } from "./Cosponsors"
import { LabeledContainer } from "./LabeledContainer"
import { BillProps } from "./types"
import { dateInFuture } from "components/db/events"
import { useMediaQuery } from "usehooks-ts"
import { Card as MapleCard } from "../Card"
import clsx from "clsx"

const HearingDate = styled.div`
  font-weight: 500;
  font-size: 22px;
  line-height: 125%;

  text-align: center;
  color: #ffffff;

  align-self: stretch;
  max-width: 202px;
`

export const Committees: FC<React.PropsWithChildren<BillProps>> = ({
  bill,
  className
}) => {
  const current = bill.currentCommittee
  if (!current) return null
  return (
    <Container className={`${className} p-0`}>
      <MapleCard
        className={className}
        headerElement={
          <Card.Header className="h4 bg-secondary text-light">
            {useTranslation("common").t("bill.committee")}
          </Card.Header>
        }
        body={
          <div className={`d-flex justify-content-around p-2`}>
            <LabeledIcon
              idImage={"/profile_icon_govt-secondary.svg"}
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
        }
      />
    </Container>
  )
}

export const Hearing: FC<React.PropsWithChildren<BillProps>> = ({
  bill,
  className
}) => {
  const { t, tDate } = useTranslation("common")
  return (
    <>
      {bill.nextHearingAt && dateInFuture(bill.nextHearingAt) ? (
        <LabeledContainer className={className}>
          <HearingDate>
            {t("bill.hearing_scheduled_for", {
              date: tDate(fromUnixTime(bill.nextHearingAt?.seconds), "PPpp")
            })}
          </HearingDate>
        </LabeledContainer>
      ) : null}
    </>
  )
}

export const Sponsors: FC<React.PropsWithChildren<BillProps>> = ({
  bill,
  className
}) => {
  const primary = bill.content?.PrimarySponsor
  const cosponsors = bill.content.Cosponsors.filter(s => s.Id !== primary?.Id)
  const more = cosponsors.length > 2
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation("common")
  const countShowSponsors = isMobile ? 1 : 2

  return (
    <Container className={`${className} p-0`}>
      <MapleCard
        className={className}
        headerElement={
          <Card.Header className="h4 bg-secondary text-light">
            {t("sponsors")}
          </Card.Header>
        }
        body={
          <div className={`${className} p-2`}>
            <div
              className={clsx(
                "mt-2 pb-3 d-flex justify-content-right",
                more && "border-bottom border-1 border-dark"
              )}
            >
              {primary && (
                <LabeledIcon
                  idImage={`https://malegislature.gov/Legislators/Profile/170/${primary.Id}.jpg`}
                  mainText={t("primarySponsor")}
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
                .slice(0, countShowSponsors)
                .map(s => (
                  <LabeledIcon
                    key={s.Id}
                    idImage={`https://malegislature.gov/Legislators/Profile/170/${s.Id}.jpg`}
                    mainText={t("sponsor")}
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
                  {t("bill.seeCosponsors", { count: bill.cosponsorCount })}
                </Cosponsors>
              )}
            </div>
          </div>
        }
      />
    </Container>
  )
}
