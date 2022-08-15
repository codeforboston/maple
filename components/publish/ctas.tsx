import { ReactElement } from "react"
import { Button, Image } from "react-bootstrap"
import styled from "styled-components"
import { SignInWithModal } from "../auth"
import { useAppSelector } from "../hooks"
import { Wrap } from "../links"

const Styled = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background-color: var(--bs-blue);
  border-radius: 1rem;
  padding: 1.5rem 1rem 1.5rem 1rem;
  color: white;
`

const Cta = ({ title, cta }: { title: string; cta: ReactElement }) => {
  return (
    <Styled>
      <div className="text-center">{title}</div>
      <Image alt="" className="mt-2 mb-2" src="testimony-panel-empty.svg" />
      {cta}
    </Styled>
  )
}

const OpenForm = ({ label }: { label: string }) => {
  const billId = useAppSelector(state => state.publish.bill?.id)
  return (
    <Wrap href={`/submit-testimony?billId=${billId}&step=position`}>
      <Button variant="primary">{label}</Button>
    </Wrap>
  )
}

export const CreateTestimony = () => (
  <Cta
    title="You Haven't Submitted Testimony"
    cta={<OpenForm label="Create Testimony" />}
  />
)

export const FinishTestimony = () => (
  <Cta
    title="Finish Submitting Your Testimony"
    cta={<OpenForm label="Finish Testimony" />}
  />
)

export const SignedOut = () => (
  <Cta
    title="Sign In to Add Testimony"
    cta={<SignInWithModal label="Sign In/Sign Up" />}
  />
)
