import clsx from "clsx"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Image } from "../bootstrap"
import { Bill, Profile } from "../db"

export function QuickInfo({ bill, profile }: { bill: Bill; profile: Profile }) {
  const {
      content: { Title },
      city,
      currentCommittee: committee
    } = bill,
    { representative, senator } = profile,
    hasLegislators = Boolean(representative || senator)
  return (
    <InfoContainer>
      <Label>You're writing testimony about</Label>
      <Chip className="brown">
        {Title}&nbsp;(Bill {bill.id})
      </Chip>
      {city && (
        <>
          <Label>in</Label>
          <Chip>{city}, Massachusetts</Chip>
        </>
      )}
      <Sponsors bill={bill} />
      {committee && (
        <>
          <Label>and the committee is</Label>
          <Chip>{committee.name}</Chip>
        </>
      )}
      {hasLegislators && (
        <>
          <Label>and your legislators are</Label>
          {representative && (
            <Chip>
              Representative <b>{representative.name}</b>
            </Chip>
          )}
          {senator && (
            <Chip className={clsx(senator && representative && "mt-2")}>
              Senator <b>{senator.name}</b>
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
    const { PrimarySponsor: primarySponsor, Cosponsors: cosponsors } =
      bill.content

    const isMobile = useMediaQuery("(max-width: 768px)")

    let cosponsorsShown = isMobile ? 0 : 5,
      shown = cosponsors.slice(0, cosponsorsShown),
      overflowCount = cosponsors.length - shown.length

    return (
      <>
        <Label>and it is sponsored by</Label>
        <SponsorList>
          {primarySponsor && (
            <Chip>
              <Image alt="Primary Sponsor" src="/star.svg" />
              {primarySponsor.Name}
            </Chip>
          )}
          {shown.map(m => (
            <Chip key={m.Id}>{m.Name}</Chip>
          ))}
          {!!overflowCount && (
            <Chip className="overflow">And {overflowCount} more</Chip>
          )}
        </SponsorList>
      </>
    )
  }
