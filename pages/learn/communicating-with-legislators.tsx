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

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"]))
      // Will be passed to the page component as props
    }
  }
}
