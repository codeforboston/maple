import { Container } from "../../components/bootstrap"
import { createPage } from "../../components/page"
import AdditionalResourcesCard from "../../components/AdditionalResources/AdditionalResourcesCard"
import AdditionalResourcesCardContent from "../../components/AdditionalResources/AdditionalResourcesCardContent"
import styles from "../../components/AdditionalResources/AdditionalResourcesCard.module.css"

const content = [
  {
    paragraph: {
      P1: (
        <>
          The MA Legislature has an{" "}
          <a href="https://malegislature.gov/Search/FindMyLegislator">
            online tool
          </a>{" "}
          you can use to identify your legislators based on your home address.
        </>
      )
    }
  },
  {
    paragraph: {
      P1: (
        <>
          The MA Legislature publishes a{" "}
          <a href="https://www.mass.gov/doc/the-legislative-process-0/download">
            document on the legislative process.
          </a>
        </>
      )
    }
  },
  {
    paragraph: {
      P1: (
        <>
          Mass Legal Services published a 2007 guide to The{" "}
          <a href="https://www.masslegalservices.org/content/legislative-process-massachusetts-0">
            Legislative Process in Massachusetts.
          </a>
        </>
      )
    }
  }
]

export default createPage({
  title: "Additional Resources",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1 className={styles.title}>Additional Resources</h1>
        <p className={styles.subheader}>
          We hope these pages will help you submit effective testimony. You may
          want to consult these other resources to build a more detailed
          understanding of the legislative process and how you can contribute.
        </p>
        {content.map((value, index) => (
          <AdditionalResourcesCard key={index}>
            <AdditionalResourcesCardContent key={index}>
              {value.paragraph}
            </AdditionalResourcesCardContent>
          </AdditionalResourcesCard>
        ))}
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
