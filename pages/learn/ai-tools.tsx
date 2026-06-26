import { Container } from "../../components/bootstrap"
import { createPage } from "../../components/page"
import { createGetStaticTranslationProps } from "components/translations"
import AiTools from "components/learn/AiTools/AiTools"

export default createPage({
  titleI18nKey: "titles.ai_tools",
  Page: () => {
    return (
      <Container>
        <AiTools />
      </Container>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "aiTools"
])
