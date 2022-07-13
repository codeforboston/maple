import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"
import AdditionalResourcesCard from "../components/AdditionalResources/AdditionalResourcesCard"
import AdditionalResourcesCardContent from "../components/AdditionalResources/AdditionalResourcesCardContent"
import styles from "../components/AdditionalResources/AdditionalResourcesCard.module.css"

const content = [
  {
    paragraph: {
      title: ``,
      P1: `The MA Legislature has an online tool you can use to identify your legislators based on your home address.`
      // https://malegislature.gov/Search/FindMyLegislator
    }
  },
  {
    paragraph: {
      title: ``,
      P1: `The MA Legislature publishes a 13-step guide on How an Idea Becomes a Law.`
    }
  },
  {
    paragraph: {
      title: ``,
      P1: `Mass Legal Services published a 2007 guide to The Legislative Process in Massachusetts.`
      //  https://www.masslegalservices.org/content/legislative-process-massachusetts-0
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
