import AdditionalResources from "components/AdditionalResources"
import { Container } from "../../components/bootstrap"
import { createPage } from "../../components/page"
import Legislative from "components/Legislative/Legislative"
import { createGetStaticTranslationProps } from "components/translations"

// TODO: Change
export default createPage({
  title: "How To Have Impact Through Legislative Testimony",
  Page: () => {
    return (
      <Container>
        <Legislative />
        <AdditionalResources />
      </Container>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "testimony",
  "learnComponents"
])
