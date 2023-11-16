import { ReactElement } from "react"
import { Button, ButtonProps, Image } from "react-bootstrap"
import styled from "styled-components"
import { SignInWithButton, useAuth } from "../../auth"
import { Wrap } from "../../links"
import { formUrl, usePublishState } from "../hooks"

const Styled = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background-color: var(--bs-blue);
  border-radius: 1rem;
  padding: 1.5rem 1rem 1.5rem 1rem;
  color: white;

  .title {
    font-size: 1.25rem;
    font-weight: bold;
  }
`

const Cta = ({
  title,
  cta,
  className
}: {
  title: string
  cta: ReactElement
  className?: string
}) => {
  return (
    <Styled className={className}>
      <div className="text-center title">{title}</div>
      <Image alt="" className="mt-2 mb-2" src="/testimony-panel-empty.svg" />
      {cta}
    </Styled>
  )
}

const OpenForm = ({ label, ...props }: { label: string } & ButtonProps) => {
  const bill = usePublishState().bill!
  return (
    <Wrap href={formUrl(bill.id, bill.court)}>
      <Button variant="primary" {...props}>
        {label}
      </Button>
    </Wrap>
  )
}

export const CreateTestimony = () => (
  <Cta
    title="You Haven't Submitted Testimony"
    cta={<OpenForm label="Create Testimony" />}
  />
)

export const CompleteTestimony = () => (
  <Cta
    title="You Have Draft Testimony"
    cta={
      <OpenForm
        label="Complete Testimony"
        variant="info"
        className="text-white"
      />
    }
    className="text-info"
  />
)

export const SignedOut = () => (
  <Cta
    title="Sign In to Add Testimony"
    cta={<SignInWithButton label="Sign In/Sign Up" />}
  />
)

export const UnverifiedEmail = () => {
  const id = useAuth().user?.uid!

  return (
    <Cta
      title="Verify Your Email to Add Testimony"
      cta={
        <Wrap href={`/profile?id=${id}`}>
          <Button variant="primary">Verify Your Email</Button>
        </Wrap>
      }
    />
  )
}

export const PendingUpgrade = () => {
  return (
    <Cta
      title="Pending Upgrade"
      cta={
        <Button variant="primary" disabled>
          Your Organization Registration is Pending
        </Button>
      }
    />
  )
}
