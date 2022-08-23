import clsx from "clsx"
import styled from "styled-components"
import { Col, Container, Image, Row, Spinner } from "../bootstrap"
import { Bill, Profile } from "../db"
import * as links from "../links"
import { ChooseStance } from "./ChooseStance"
import { useFormInfo } from "./hooks"
import { ProgressBar } from "./ProgressBar"
import { PublishTestimony } from "./PublishTestimony"
import { Step } from "./redux"
import { SelectLegislatorsCta } from "./SelectLegislatorsCta"
import { ShareTestimony } from "./ShareTestimony"
import { WriteTestimony } from "./WriteTestimony"

const Background = styled.div`
  background: linear-gradient(to right, white 50%, var(--bs-body-bg) 50%);
`

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

export const SubmitTestimonyForm = () => {
  const form = useFormInfo()

  return form.ready ? (
    <Background>
      <StyledContainer fluid="lg">
        <Row className="g-0">
          <Col xs={9}>
            <Form step={form.step} bill={form.bill} synced={form.synced} />
          </Col>
          <Col xs={3}>
            <QuickInfo bill={form.bill} profile={form.profile} />
          </Col>
        </Row>
      </StyledContainer>
    </Background>
  ) : (
    <Spinner animation="border" />
  )
}

const FormContainer = styled.div`
  background: white;
  padding-right: 2rem;
  height: 100%;
  padding-top: 1rem;
`

const Divider = styled.div`
  height: 1px;
  background-color: var(--bs-gray-500);
`

const Form = ({
  step,
  bill,
  synced
}: {
  step: Step
  bill: Bill
  synced: boolean
}) => {
  const content: Record<Step, React.ReactNode> = {
    position: <ChooseStance />,
    write: <WriteTestimony />,
    publish: <PublishTestimony />,
    selectLegislators: <SelectLegislatorsCta />,
    share: <ShareTestimony />
  }
  return (
    <FormContainer>
      <links.Internal
        href={`/bill?id=${bill!.id}`}
        className={clsx(!synced && "pe-none")}
      >
        Back to Bill
      </links.Internal>
      <Overview className="mt-3" />
      <ProgressBar className="mt-4 mb-4" currentStep={step} />
      {content[step]}
    </FormContainer>
  )
}

const Overview = ({ className }: { className: string }) => (
  <div className={clsx("d-flex", className)}>
    <div>
      <h1>Write a Testimonial</h1>
      <Divider className="me-5" />
      <div className="mt-2">
        Let your voice be heard, MAPLE gives users the ability to send their
        unfiltered feedback on policies to legislators, comittees, and other
        relevant parties. <b>Writing a testimonial is as easy as 1-2-3!</b>
      </div>
    </div>
    <div>
      <Image className="ms-4 " alt="" src="writing.svg" />
    </div>
  </div>
)

const Chip = styled.div`
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
    padding: 2rem 1rem 1rem 1rem;
    height: 100%;
  `

const QuickInfo = ({ bill, profile }: { bill: Bill; profile: Profile }) => {
  const {
      content: { Title },
      city,
      currentCommittee: committee
    } = bill,
    { representative, senator } = profile,
    hasLegislators = Boolean(representative || senator)
  return (
    <InfoContainer>
      <Label>You're writing a testimony about</Label>
      <Chip className="brown">{Title}</Chip>
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

const SponsorList = styled.div`
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
        bill.content,
      cosponsorsShown = 5,
      shown = cosponsors.slice(0, cosponsorsShown),
      overflowCount = cosponsors.length - shown.length

    return (
      <>
        <Label>and it is sponsored by</Label>
        <SponsorList>
          <Chip>
            <Image alt="Primary Sponsor" src="star.svg" />
            {primarySponsor.Name}
          </Chip>
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
