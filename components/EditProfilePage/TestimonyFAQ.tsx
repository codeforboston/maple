import styled from "styled-components"
import { Card, Col, Image } from "react-bootstrap"

const StyledCard = styled(Card)`
  flex-grow: 1;
  border-radius: 1rem;
  background: var(--bs-blue);
  border: none;
  color: white;
  font-family: Nunito;
  padding: 1.5rem 2rem;
`

export const TestimonyFAQ = ({ className }: { className: string }) => {
  return (
    <StyledCard className={className}>
      <Card.Body>
        <h2>Testimony FAQ</h2>
        <div className="p-4 m-3 d-flex justify-content-center">
          <Image
            className="w-100"
            fluid
            alt="writing icon"
            src="/writing.svg"
          ></Image>
        </div>

        <h4>Editing Testimony</h4>
        <p>
          Editing testimony is allowed but users will be able to see edit
          history.
        </p>
        <p>
          {" "}
          Provide an edit reason to inform your fellow users on why you changed
          a particular stance/message.
        </p>
        <hr></hr>
        <h4>Rescinding testimony </h4>
        <p>Testimonies can't be deleted but are hidden from the platform</p>
      </Card.Body>
    </StyledCard>
  )
}
