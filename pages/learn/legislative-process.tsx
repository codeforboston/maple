import AdditionalResources from "components/AdditionalResources"
import { Container } from "../../components/bootstrap"
import { createPage } from "../../components/page"
import Legislative from "components/Legislative/Legislative"
import { createGetStaticTranslationProps } from "components/translations"

// TODO: Change
export default createPage({
  titleI18nKey: "titles.legislative_process",
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
