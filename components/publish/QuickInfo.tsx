import clsx from "clsx"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Image } from "../bootstrap"
import { Bill, Profile } from "../db"
import { useTranslation } from "next-i18next"

export function QuickInfo({ bill, profile }: { bill: Bill; profile: Profile }) {
  const { t } = useTranslation("testimony")
  const {
      content: { Title },
      city,
      currentCommittee: committee
    } = bill,
    { representative, senator } = profile,
    hasLegislators = Boolean(representative || senator)
  return (
    <InfoContainer>
      <Label>{t("quickInfo.writingAbout")}</Label>
      <Chip className="brown">
        {Title}&nbsp;({t("common:titles.bill")} {bill.id})
      </Chip>
      {city && (
        <>
          <Label>{t("quickInfo.in")}</Label>
          <Chip>{t("quickInfo.inCityState", { city })}</Chip>
        </>
      )}
      <Sponsors bill={bill} />
      {committee && (
        <>
          <Label>{t("quickInfo.committeeIs")}</Label>
          <Chip>{committee.name}</Chip>
        </>
      )}
      {hasLegislators && (
        <>
          <Label>{t("quickInfo.yourLegislatorsAre")}</Label>
          {representative && (
            <Chip>
              {t("quickInfo.representative")} <b>{representative.name}</b>
            </Chip>
          )}
          {senator && (
            <Chip className={clsx(senator && representative && "mt-2")}>
              {t("quickInfo.senator")} <b>{senator.name}</b>
            </Chip>
          )}
        </>
      )}
    </InfoContainer>
  )
}

export const Chip = styled.div`
    background-color: var(--bs-blue);
    color: white;
    border-radius: 1.5rem;
    text-align: center;
    padding: 0.5rem 1rem 0.5rem 1rem;
    overflow: hidden;
    font-size: 0.75rem;
    line-height: 1rem;

    img {
      vertical-align: baseline;
      height: 0.75rem;
      margin-right: 0.2rem;
    }
  `,
  Label = styled.div`
    text-align: center;
    color: var(--bs-blue);
    font-weight: 700;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  `,
  InfoContainer = styled.div`
    background: var(--bs-body-bg);
    display: flex;
    flex-direction: column;
    padding: 1rem;
    height: 100%;
  `

export const SponsorList = styled.div`
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.5rem;

    .overflow {
      grid-column: 1 / -1;
    }

    @media (min-width: 992px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  `,
  Sponsors = ({ bill }: { bill: Bill }) => {
    const { t } = useTranslation(["testimony", "common"])
    const { PrimarySponsor: primarySponsor, Cosponsors: cosponsors } =
      bill.content

    const isMobile = useMediaQuery("(max-width: 768px)")

    let cosponsorsShown = isMobile ? 0 : 5,
      shown = cosponsors.slice(0, cosponsorsShown),
      overflowCount = cosponsors.length - shown.length

    return (
      <>
        <Label>{t("testimony:quickInfo.sponsoredBy")}</Label>
        <SponsorList>
          {primarySponsor && (
            <Chip>
              <Image alt={t("common:primarySponsor")} src="/star.svg" />
              {primarySponsor.Name}
            </Chip>
          )}
          {shown.map(m => (
            <Chip key={m.Id}>{m.Name}</Chip>
          ))}
          {!!overflowCount && (
            <Chip className="overflow">
              {t("testimony:quickInfo.andMore", { count: overflowCount })}
            </Chip>
          )}
        </SponsorList>
      </>
    )
  }
