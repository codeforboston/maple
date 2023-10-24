import clsx from "clsx"
import styled from "styled-components"
import { Col, Container, Image, Row, Spinner } from "../bootstrap"
import { Bill } from "../db"
import * as links from "../links"
import { ChooseStance } from "./ChooseStance"
import { useFormInfo } from "./hooks"
import { ProgressBar } from "./ProgressBar"
import { PublishInfo } from "./PublishInfo"
import { PublishTestimony } from "./PublishTestimony"
import { QuickInfo } from "./QuickInfo"
import { Step } from "./redux"
import { SelectLegislatorsCta } from "./SelectLegislatorsCta"
import { ShareTestimony } from "./ShareTestimony"
import { WriteTestimony } from "./WriteTestimony"
import { KeepNote } from "./KeepNote"

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
            {form.step == "position" ? (
              <QuickInfo bill={form.bill} profile={form.profile} />
            ) : (
              <KeepNote currentStep={form.step} />
            )}
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
    selectLegislators: <SelectLegislatorsCta />,
    write: <WriteTestimony />,
    publish: <PublishTestimony />,
    share: <ShareTestimony />
  }

  return (
    <FormContainer>
      <links.Internal
        href={links.maple.bill(bill)}
        className={clsx(!synced && "pe-none")}
      >
        Back to Bill (Bill {bill.id})
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
      <h1>Write, Publish, and Send Your Testimony!</h1>
      <Divider className="me-5" />
      <div className="mt-2" style={{ fontWeight: "bolder" }}>
        Your voice matters. And it's important that you share it. MAPLE helps
        you 1) write testimony, 2) publish it to our community, and 3) send it
        to the right legislators so it can be formally considered. It's easy as
        1-2-3!
      </div>
    </div>
    <div>
      <Image className="ms-4 " alt="" src="/writing.svg" />
    </div>
  </div>
)
