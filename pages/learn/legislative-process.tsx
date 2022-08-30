import { Container } from "../../components/bootstrap"
import { createPage } from "../../components/page"
import CommunicatingWithLegislators from "../../components/CommunicatingWithLegislators/CommunicatingWithLegislators"

export default createPage({
  title: "How To Have Impact Through Legislative Testimony",
  Page: () => {
    return (
      <Container>
        <CommunicatingWithLegislators />
      </Container>
    )
  }
})
