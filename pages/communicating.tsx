import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"
import CommunicatingWithLegislators from "../components/CommunicatingWithLegislators/CommunicatingWithLegislators"

export default createPage({
  title: "Communicating With Legislators",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <CommunicatingWithLegislators />
    </Container>    )
  }
})